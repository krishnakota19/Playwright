from jira import JIRA
import urllib3
from datetime import datetime
import os
import requests
import json
from requests.auth import HTTPBasicAuth
import re
from bs4 import BeautifulSoup
import getpass

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# --- SIMPLE CONFIGURATION ---
JIRA_SERVER = 'https://jira'
CUSTOMFIELD_ACCEPTANCE_CRITERIA = 'customfield_18460'

# Confluence REST API Configuration (same as wiki_page_fetcher_confluence)
WIKI_URL = 'https://wiki.com'  #  Global Wiki URL
WIKI_API_URL = 'https://wiki.com/rest/api/content'  # Confluence REST API endpoint

# Global variables for credentials (will be set at runtime)
username = None
password = None
WIKI_USER = None
WIKI_PASSWORD = None
jira = None

def get_credentials():
    """Securely prompt for JIRA and Wiki credentials at runtime"""
    global username, password, WIKI_USER, WIKI_PASSWORD, jira
    
    print("\n🔐 Please enter your credentials:")
    print("=" * 40)
    
    # Prompt for JIRA credentials
    print("\nJIRA Credentials:")
    username = input("JIRA Username: ").strip()
    password = getpass.getpass("JIRA Password: ")
    
    # Prompt for Wiki credentials (allow same as JIRA)
    print("\nWiki Credentials:")
    use_same = input("Use same credentials for Wiki? (y/n): ").strip().lower()
    
    if use_same in ['y', 'yes']:
        WIKI_USER = username
        WIKI_PASSWORD = password
        print("✅ Using same credentials for Wiki")
    else:
        WIKI_USER = input("Wiki Username: ").strip()
        WIKI_PASSWORD = getpass.getpass("Wiki Password/API Token: ")
    
    # Initialize JIRA connection
    try:
        print("\n🔗 Connecting to JIRA...")
        jira = JIRA(server=JIRA_SERVER, basic_auth=(username, password), options={'verify': False})
        print("✅ JIRA connection successful")
    except Exception as e:
        print(f"❌ JIRA connection failed: {e}")
        raise
    
    print("\n" + "=" * 40)

def get_story(story_id):
    """Get story information from JIRA"""
    issue = jira.issue(story_id)
    return {
        'summary': issue.fields.summary,
        'description': issue.fields.description,
        'acceptance_criteria': getattr(issue.fields, CUSTOMFIELD_ACCEPTANCE_CRITERIA, '')
    }

def get_related_defects(story):
    """Get related defects from JIRA"""
    jql = f'project=ProjectKEY AND issuetype=Bug AND description~"{story["summary"]}"'
    bugs = jira.search_issues(jql, maxResults=5)
    return [bug.fields.description for bug in bugs if bug.fields.description]

def search_wiki(story_id):
    """Simple function to search  Global Wiki using Confluence REST API (same as wiki_page_fetcher_confluence)"""
    
    print(f"🔍 Searching  Global Wiki for: {story_id}")
    
    # Confluence REST API search (same pattern as wiki_page_fetcher_confluence)
    search_url = f"{WIKI_URL}/rest/api/content/search"
    params = {
        "cql": f'title ~ "{story_id}" OR text ~ "{story_id}"',
        "limit": 10,
        "expand": "space,body.storage"
    }
    
    auth = HTTPBasicAuth(WIKI_USER, WIKI_PASSWORD)
    
    try:
        # Make the request using Confluence REST API
        response = requests.get(
            search_url,
            params=params,
            auth=auth,
            verify=False,  # Skip SSL verification for  internal sites
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if we got search results (Confluence format)
            if 'results' in data and data['results']:
                pages = data['results']
                print(f"✅ Found {len(pages)} pages in  Global Wiki")
                
                # Simple list to store page info (same format as wiki_page_fetcher_confluence)
                wiki_pages = []
                
                for page in pages:
                    page_info = {
                        'title': page.get('title', 'No Title'),
                        'url': f"{WIKI_URL}/display/{page.get('space', {}).get('key', '')}/{page.get('title', '').replace(' ', '+')}",
                        'snippet': page.get('excerpt', ''),
                        'size': len(page.get('body', {}).get('storage', {}).get('value', '')) if page.get('body') else 0,
                        'id': page.get('id', ''),
                        'space': page.get('space', {}).get('key', 'Unknown')
                    }
                    wiki_pages.append(page_info)
                
                return wiki_pages
            else:
                print(f"✅ Connected to wiki, but no search results found for: {story_id}")
                return []
            
        else:
            print(f"❌ Wiki search failed: HTTP {response.status_code}")
            if response.status_code == 401:
                print("   Authentication failed - check username/password")
            elif response.status_code == 403:
                print("   Access forbidden - check permissions")
            elif response.status_code == 404:
                print("   The wiki API endpoint might be incorrect")
            return []
            
    except requests.exceptions.SSLError as e:
        print(f"❌ SSL Error: {e}")
        print("   Trying to connect anyway (SSL verification disabled)")
        return []
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error - Cannot reach wiki.com")
        print("   Make sure you're on  VPN or internal network")
        return []
    except Exception as e:
        print(f"❌ Error searching wiki: {e}")
        return []

def extract_text_from_html(html_content):
    """Extract clean text from HTML content, removing all HTML tags and formatting"""
    
    if not html_content:
        return ""
    
    try:
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove script and style elements completely
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text content
        text = soup.get_text()
        
        # Clean up the text
        # Replace multiple whitespaces with single space
        text = re.sub(r'\s+', ' ', text)
        
        # Remove extra newlines and spaces
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            if line:  # Skip empty lines
                cleaned_lines.append(line)
        
        # Join lines with proper spacing
        clean_text = '\n'.join(cleaned_lines)
        
        return clean_text
        
    except Exception as e:
        print(f"⚠️ Error extracting text from HTML: {e}")
        # Fallback: simple regex to remove HTML tags
        clean_text = re.sub(r'<[^>]+>', '', html_content)
        clean_text = re.sub(r'\s+', ' ', clean_text)
        return clean_text.strip()

def save_comprehensive_content(story_id, story, defects, best_page_content, wiki_title=None, product_name=None):
    """Save JIRA story, related defects, and wiki content all in one comprehensive text file"""
    
    print("🧹 Creating comprehensive content file...")
    
    # Create the content with all information
    content = f"Comprehensive Analysis Report\n"
    content += f"============================\n\n"
    content += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    
    # Search Parameters
    content += f"🔍 SEARCH PARAMETERS\n"
    content += f"====================\n"
    content += f"JIRA Story ID: {story_id}\n"
    if wiki_title:
        content += f"User-specified Wiki Title: {wiki_title}\n"
    if product_name:
        content += f"User-specified Product: {product_name}\n"
    if not wiki_title and not product_name:
        content += f"Search Method: Auto-detection from JIRA story\n"
    content += f"\n"
    
    # JIRA Story Information (Detailed)
    content += f"📋 JIRA STORY DETAILS\n"
    content += f"=====================\n"
    content += f"Story ID: {story_id}\n"
    content += f"Summary: {story['summary']}\n\n"
    
    # Description
    if story.get('description'):
        content += f"Description:\n"
        content += f"------------\n"
        # Clean up description if it contains HTML
        clean_description = extract_text_from_html(story['description']) if story['description'] else 'No description available'
        content += f"{clean_description}\n\n"
    else:
        content += f"Description: No description available\n\n"
    
    # Acceptance Criteria
    if story.get('acceptance_criteria'):
        content += f"Acceptance Criteria:\n"
        content += f"-------------------\n"
        clean_criteria = extract_text_from_html(story['acceptance_criteria']) if story['acceptance_criteria'] else 'No acceptance criteria available'
        content += f"{clean_criteria}\n\n"
    else:
        content += f"Acceptance Criteria: No acceptance criteria available\n\n"
    
    # Related Defects Information
    content += f"🐛 RELATED DEFECTS\n"
    content += f"==================\n"
    if defects and len(defects) > 0:
        content += f"Found {len(defects)} related defects:\n\n"
        for i, defect in enumerate(defects, 1):
            content += f"Defect #{i}:\n"
            content += f"-----------\n"
            # Clean up defect description if it contains HTML
            clean_defect = extract_text_from_html(defect) if defect else 'No description available'
            content += f"{clean_defect}\n\n"
    else:
        content += f"No related defects found.\n\n"
    
    # Wiki Page Information and Content
    if best_page_content:
        # Extract clean text from HTML content
        clean_text = extract_text_from_html(best_page_content.get('html_content', ''))
        
        content += f"📖 BEST MATCHING WIKI PAGE\n"
        content += f"===========================\n"
        content += f"Title: {best_page_content['title']}\n"
        content += f"Space: {best_page_content['space']}\n"
        content += f"URL: {best_page_content['url']}\n"
        content += f"Page ID: {best_page_content['id']}\n"
        content += f"Original Size: {best_page_content['size']} characters (HTML)\n"
        content += f"Clean Text Size: {len(clean_text)} characters\n"
        content += f"Last Modified: {best_page_content['last_modified']}\n\n"
        
        # Clean Text Content from Wiki
        content += f"📄 WIKI PAGE CONTENT\n"
        content += f"====================\n\n"
        if clean_text:
            content += clean_text
        else:
            content += "No text content could be extracted from the wiki page."
    else:
        content += f"📖 WIKI INFORMATION\n"
        content += f"===================\n"
        content += f"No matching wiki page found for this story.\n"
    
    # Save to file
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    if best_page_content:
        safe_title = "".join(c for c in best_page_content['title'] if c.isalnum() or c in (' ', '-', '_')).rstrip()
        filename = f"Comprehensive_Report_{safe_title.replace(' ', '_')}_{story_id}_{timestamp}.txt"
    else:
        filename = f"Comprehensive_Report_{story_id}_{timestamp}.txt"
    
    filepath = os.path.join(os.getcwd(), filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Comprehensive report saved with:")
    print(f"   • JIRA Story Details")
    print(f"   • {len(defects)} Related Defects")
    print(f"   • Wiki Content: {'Yes' if best_page_content else 'No'}")
    if wiki_title:
        print(f"   • Wiki Search: User-specified title '{wiki_title}'")
    if product_name:
        print(f"   • Product Filter: '{product_name}'")
    print(f"\n💾 File saved: {filename}")
    return filepath

def extract_feature_name(story):
    """Extract feature name from JIRA story using generic patterns"""
    
    # Get the summary and description
    summary = story.get('summary', '')
    description = story.get('description', '') if story.get('description') else ''
    
    print(f"📝 Extracting feature name from story...")
    print(f"   Summary: {summary[:80]}...")
    
    import re
    
    # Words to exclude from feature names (testing/environment related)
    exclude_words = [
        'testing', 'test', 'tests', 'qa', 'qat', 'uat', 'sit', 'environment', 
        'env', 'prod', 'production', 'staging', 'dev', 'development', 'defect',
        'bug', 'fix', 'issue', 'problem', 'error', 'failure', 'broken'
    ]
    
    # Generic patterns that work for most JIRA stories
    generic_patterns = [
        # Pattern 1: "Add/Create/Implement [something]"
        r'(?:add|create|implement|build|develop)\s+(?:a\s+)?(.+?)(?:\s+when|\s+for|\s+to|\s+that|$)',
        
        # Pattern 2: "Fix/Update/Modify [something]"
        r'(?:fix|update|modify|change|enhance)\s+(?:the\s+)?(.+?)(?:\s+when|\s+for|\s+to|\s+that|$)',
        
        # Pattern 3: "[Action] [Object]" - general action-object pattern
        r'^(.+?)\s+(?:functionality|feature|process|system|module|component)',
        
        # Pattern 4: Extract main noun phrases (first 2-4 words)
        r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})',
        
        # Pattern 5: Words in parentheses (often feature names)
        r'\(([^)]+)\)',
        
        # Pattern 6: Quoted text (often feature names)
        r'"([^"]+)"',
        
        # Pattern 7: Words after "for" or "to" (purpose/feature)
        r'(?:for|to)\s+(.+?)(?:\s+when|\s+so\s+that|\s+in\s+order|$)',
        
        # Pattern 8: Capitalized words (likely feature names)
        r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b'
    ]
    
    found_features = []
    
    # Apply generic patterns to summary
    for pattern in generic_patterns:
        matches = re.findall(pattern, summary, re.IGNORECASE)
        for match in matches:
            # Clean up the match
            clean_match = match.strip()
            # Remove common stop words and exclude words
            stop_words = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an']
            words = clean_match.split()
            
            # Filter out stop words, exclude words, and short words
            filtered_words = []
            for word in words:
                if (word.lower() not in stop_words and 
                    word.lower() not in exclude_words and 
                    len(word) > 2):
                    filtered_words.append(word)
            
            if len(filtered_words) >= 1 and len(' '.join(filtered_words)) > 3:
                feature = ' '.join(filtered_words).title()
                if feature not in found_features and len(feature.split()) <= 4:  # Max 4 words
                    found_features.append(feature)
    
    # Generic approach: Extract key nouns and verbs from summary
    # Split summary into words and find meaningful terms
    words = re.findall(r'\b[A-Za-z]{3,}\b', summary)  # Words with 3+ letters
    
    # Common business/technical terms that often indicate features
    business_indicators = [
        'process', 'transaction', 'system', 'management', 'service', 'interface',
        'workflow', 'report', 'dashboard', 'notification', 'integration', 'api',
        'validation', 'calculation', 'generation', 'synchronization', 'authentication',
        'authorization', 'configuration', 'monitoring', 'logging', 'backup'
    ]
    
    # Look for combinations of business terms
    for i, word in enumerate(words[:-1]):
        next_word = words[i + 1]
        combined = f"{word} {next_word}".title()
        
        # If either word is a business indicator, consider the combination
        if (word.lower() in business_indicators or next_word.lower() in business_indicators) and \
           combined not in found_features and len(combined) > 5:
            found_features.append(combined)
    
    # Fallback: Use first meaningful words from summary
    if not found_features:
        # Remove common prefixes and get main content
        summary_clean = re.sub(r'^(?:QA\s+\+?\s*)?(?:Dev\s+)?(?:Defect\s+)?(?:fix\s+)?[-\s]*', '', summary, flags=re.IGNORECASE)
        first_words = summary_clean.split()[:3]  # First 3 words
        if len(first_words) >= 2:
            fallback_feature = ' '.join(first_words).title()
            found_features.append(fallback_feature)
    
    # Clean up and limit results
    final_features = []
    for feature in found_features[:5]:  # Max 5 features
        # Remove special characters and clean up
        clean_feature = re.sub(r'[^\w\s]', '', feature).strip()
        if len(clean_feature) > 3 and clean_feature not in final_features:
            final_features.append(clean_feature)
    
    if final_features:
        print(f"✅ Extracted features: {', '.join(final_features[:3])}")
        return final_features[:3]  # Return top 3
    else:
        # Ultimate fallback: use story type + first word
        story_type = "Feature"  # Generic
        first_word = summary.split()[0] if summary.split() else "Unknown"
        fallback = f"{story_type} {first_word}".title()
        print(f"💡 Using fallback feature: {fallback}")
        return [fallback]

def search_wiki_by_title_and_product(wiki_title, product_name):
    """Search  Global Wiki by specific page title and product name"""
    
    print(f"🔍 Searching  Global Wiki for:")
    print(f"   Wiki Title: {wiki_title}")
    print(f"   Product: {product_name}")
    
    all_wiki_pages = []
    
    # Strategy 1: Direct title search
    print(f"   🔎 Strategy 1: Direct title search")
    direct_pages = search_wiki_by_term(wiki_title)
    
    # Strategy 2: Title + Product combination
    print(f"   🔎 Strategy 2: Title + Product search")
    combined_pages = search_wiki_by_term(f"{wiki_title} {product_name}")
    direct_pages.extend(combined_pages)
    
    # Strategy 3: Product-specific search with title keywords
    print(f"   🔎 Strategy 3: Product-specific search")
    product_pages = search_wiki_by_term(f"{product_name} {wiki_title}")
    direct_pages.extend(product_pages)
    
    # Strategy 4: Individual words from title with product
    title_words = wiki_title.split()
    for word in title_words:
        if len(word) > 3:  # Only meaningful words
            word_product_pages = search_wiki_by_term(f"{word} {product_name}")
            direct_pages.extend(word_product_pages)
    
    # Remove duplicates and calculate relevance
    unique_pages = []
    for page in direct_pages:
        if not any(p['title'] == page['title'] for p in unique_pages):
            page['relevance_score'] = calculate_title_product_relevance(page, wiki_title, product_name)
            unique_pages.append(page)
    
    # Sort by relevance score (highest first)
    unique_pages.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
    
    print(f"✅ Found {len(unique_pages)} pages matching title and product criteria")
    return unique_pages

def calculate_title_product_relevance(page, wiki_title, product_name):
    """Calculate relevance score for wiki page based on title and product matching"""
    
    score = 0
    title = page.get('title', '').lower()
    snippet = page.get('snippet', '').lower()
    wiki_title_lower = wiki_title.lower()
    product_lower = product_name.lower()
    
    # Exact title match gets highest score
    if wiki_title_lower == title:
        score += 200
    
    # Title contains the search title
    if wiki_title_lower in title:
        score += 150
    
    # Product name in title
    if product_lower in title:
        score += 100
    
    # Both title and product in title
    if wiki_title_lower in title and product_lower in title:
        score += 50  # Bonus for having both
    
    # Title words in page title
    title_words = wiki_title_lower.split()
    for word in title_words:
        if word in title and len(word) > 3:
            score += 30
    
    # Product words in title
    product_words = product_lower.split()
    for word in product_words:
        if word in title and len(word) > 3:
            score += 25
    
    # Content matching in snippet
    if wiki_title_lower in snippet:
        score += 40
    if product_lower in snippet:
        score += 35
    
    # Title words in snippet
    for word in title_words:
        if word in snippet and len(word) > 3:
            score += 15
    
    # Product words in snippet
    for word in product_words:
        if word in snippet and len(word) > 3:
            score += 12
    
    # Page size bonus
    size = page.get('size', 0)
    if size > 5000:
        score += 20
    elif size > 1000:
        score += 15
    elif size > 500:
        score += 10
    
    return score

def calculate_title_relevance(page, wiki_title):
    """Calculate relevance score for wiki page based on title matching only"""
    
    score = 0
    title = page.get('title', '').lower()
    snippet = page.get('snippet', '').lower()
    wiki_title_lower = wiki_title.lower()
    
    # Exact title match gets highest score
    if wiki_title_lower == title:
        score += 200
    
    # Title contains the search title
    if wiki_title_lower in title:
        score += 150
    
    # Title words in page title
    title_words = wiki_title_lower.split()
    for word in title_words:
        if word in title and len(word) > 3:
            score += 40
    
    # Content matching in snippet
    if wiki_title_lower in snippet:
        score += 60
    
    # Title words in snippet
    for word in title_words:
        if word in snippet and len(word) > 3:
            score += 20
    
    # Page size bonus
    size = page.get('size', 0)
    if size > 5000:
        score += 15
    elif size > 1000:
        score += 10
    elif size > 500:
        score += 5
    
    return score

def search_wiki_by_feature(story_id, feature_names):
    """Search  Global Wiki using feature names only (excluding testing/environment terms)"""
    
    print(f"🔍 Searching  Global Wiki for feature names only: {', '.join(feature_names)}")
    
    all_wiki_pages = []
    
    # Words to exclude from search terms
    exclude_search_terms = [
        'testing', 'test', 'tests', 'qa', 'qat', 'uat', 'sit', 'environment', 
        'env', 'prod', 'production', 'staging', 'dev', 'development', 'defect',
        'bug', 'fix', 'issue', 'problem', 'error', 'failure', 'broken'
    ]
    
    # Search strategies focused on business features only
    for feature_name in feature_names:
        print(f"   🔎 Searching for feature: {feature_name}")
        
        # Clean feature name - remove any excluded terms
        clean_feature_words = []
        for word in feature_name.split():
            if word.lower() not in exclude_search_terms:
                clean_feature_words.append(word)
        
        if not clean_feature_words:
            print(f"   ⚠️ Skipping '{feature_name}' - only contains excluded terms")
            continue
            
        clean_feature = ' '.join(clean_feature_words)
        print(f"   ✨ Clean feature name: {clean_feature}")
        
        # Strategy 1: Direct clean feature search
        direct_pages = search_wiki_by_term(clean_feature)
        
        # Strategy 2: Feature with business/functional documentation terms only
        business_doc_terms = [
            "requirements", "specification", "spec", "design", "architecture",
            "implementation", "development", "documentation", "guide", "manual", 
            "procedure", "workflow", "analysis", "review", "plan", "strategy",
            "functional", "business", "process", "integration", "api"
        ]
        
        for term in business_doc_terms:
            combined_pages = search_wiki_by_term(f"{clean_feature} {term}")
            direct_pages.extend(combined_pages)
        
        # Strategy 3: Individual clean words from feature name (if multi-word)
        if len(clean_feature_words) > 1:
            for word in clean_feature_words:
                if len(word) > 3 and word.lower() not in exclude_search_terms:
                    word_pages = search_wiki_by_term(word)
                    direct_pages.extend(word_pages)
        
        # Remove duplicates for this feature
        unique_pages = []
        for page in direct_pages:
            # Additional filtering: exclude pages with testing/environment terms in title
            page_title_lower = page.get('title', '').lower()
            
            # Check if page title contains excluded terms
            contains_excluded = any(excluded_term in page_title_lower for excluded_term in exclude_search_terms)
            
            if not contains_excluded and not any(p['title'] == page['title'] for p in unique_pages):
                page['feature'] = clean_feature
                page['relevance_score'] = calculate_feature_relevance(page, clean_feature, story_id)
                unique_pages.append(page)
        
        all_wiki_pages.extend(unique_pages)
        print(f"   ✅ Found {len(unique_pages)} business/feature pages for '{clean_feature}'")
    
    # Remove overall duplicates and sort by relevance
    final_pages = []
    for page in all_wiki_pages:
        if not any(p['title'] == page['title'] for p in final_pages):
            final_pages.append(page)
    
    # Sort by relevance score (highest first)
    final_pages.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
    
    print(f"✅ Total unique feature-focused pages found: {len(final_pages)}")
    return final_pages

def calculate_feature_relevance(page, feature_name, story_id):
    """Calculate relevance score for a wiki page focusing on business features"""
    
    score = 0
    title = page.get('title', '').lower()
    snippet = page.get('snippet', '').lower()
    feature_lower = feature_name.lower()
    story_lower = story_id.lower()
    
    # Exclude pages with testing/environment terms (negative scoring)
    exclude_terms = [
        'testing', 'test', 'qa', 'environment', 'env', 'defect', 'bug', 'fix'
    ]
    
    # Penalize pages with excluded terms in title
    for term in exclude_terms:
        if term in title:
            score -= 50  # Heavy penalty
        if term in snippet:
            score -= 20  # Medium penalty
    
    # Boost pages with business/feature terms
    business_boost_terms = [
        'requirements', 'specification', 'design', 'architecture', 'functional',
        'business', 'process', 'integration', 'api', 'implementation'
    ]
    
    for term in business_boost_terms:
        if term in title:
            score += 30
        if term in snippet:
            score += 15
    
    # Title matching gets highest score (for clean feature names)
    if story_lower in title:
        score += 100
    if feature_lower in title:
        score += 80
    
    # Feature words in title
    feature_words = feature_lower.split()
    for word in feature_words:
        if word in title and len(word) > 3:  # Only meaningful words
            score += 25
    
    # Content matching gets medium score
    if story_lower in snippet:
        score += 50
    if feature_lower in snippet:
        score += 40
    
    # Feature words in snippet
    for word in feature_words:
        if word in snippet and len(word) > 3:
            score += 12
    
    # Page size bonus (larger pages often more comprehensive)
    size = page.get('size', 0)
    if size > 5000:
        score += 15
    elif size > 1000:
        score += 10
    elif size > 500:
        score += 5
    
    return max(0, score)  # Don't allow negative scores

def search_wiki_by_term(search_term):
    """Helper function to search wiki by a specific term using Confluence REST API"""
    
    # Additional filtering: don't search for excluded terms
    exclude_search_terms = [
        'testing', 'test', 'tests', 'qa', 'qat', 'uat', 'sit', 'environment', 
        'env', 'prod', 'production', 'staging', 'dev', 'development', 'defect',
        'bug', 'fix', 'issue', 'problem', 'error', 'failure', 'broken'
    ]
    
    # Check if search term is primarily excluded terms
    search_words = search_term.lower().split()
    clean_words = [word for word in search_words if word not in exclude_search_terms]
    
    if len(clean_words) == 0:
        print(f"   ⚠️ Skipping search for '{search_term}' - contains only excluded terms")
        return []
    
    # Use only clean words for search
    clean_search_term = ' '.join(clean_words)
    
    # Confluence REST API search
    search_url = f"{WIKI_URL}/rest/api/content/search"
    
    # Set up the Confluence search parameters
    params = {
        "cql": f'title ~ "{clean_search_term}" OR text ~ "{clean_search_term}"',
        "limit": 5,  # Limit per term to avoid too many results
        "expand": "space,body.storage"
    }
    
    auth = HTTPBasicAuth(WIKI_USER, WIKI_PASSWORD)
    
    try:
        # Make the request using Confluence REST API
        response = requests.get(
            search_url,
            params=params,
            auth=auth,
            verify=False,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if we got search results (Confluence format)
            if 'results' in data and data['results']:
                pages = data['results']
                
                # Filter out pages with excluded terms in title
                filtered_pages = []
                for page in pages:
                    page_title_lower = page.get('title', '').lower()
                    contains_excluded = any(excluded_term in page_title_lower for excluded_term in exclude_search_terms)
                    
                    if not contains_excluded:
                        page_info = {
                            'title': page.get('title', 'No Title'),
                            'url': f"{WIKI_URL}/display/{page.get('space', {}).get('key', '')}/{page.get('title', '').replace(' ', '+')}",
                            'snippet': page.get('excerpt', ''),
                            'size': len(page.get('body', {}).get('storage', {}).get('value', '')) if page.get('body') else 0,
                            'search_term': clean_search_term,
                            'id': page.get('id', ''),
                            'space': page.get('space', {}).get('key', 'Unknown')
                        }
                        filtered_pages.append(page_info)
                
                return filtered_pages
            else:
                return []
        else:
            return []
            
    except Exception as e:
        return []

def get_page_content_by_title(page_title):
    """Get full content of a wiki page by its title using Confluence REST API"""
    
    print(f"📖 Retrieving full content for page: {page_title}")
    
    # First, search for the page to get its ID
    search_url = f"{WIKI_URL}/rest/api/content"
    params = {
        "title": page_title,
        "expand": "body.storage,space,version",
        "limit": 1
    }
    
    auth = HTTPBasicAuth(WIKI_USER, WIKI_PASSWORD)
    
    try:
        # Search for the page by title
        response = requests.get(
            search_url,
            params=params,
            auth=auth,
            verify=False,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if 'results' in data and data['results']:
                page = data['results'][0]  # Get the first (and hopefully only) result
                
                # Extract page information and content
                page_content = {
                    'id': page.get('id', ''),
                    'title': page.get('title', 'No Title'),
                    'space': page.get('space', {}).get('key', 'Unknown'),
                    'url': f"{WIKI_URL}/display/{page.get('space', {}).get('key', '')}/{page.get('title', '').replace(' ', '+')}",
                    'last_modified': page.get('version', {}).get('when', 'Unknown'),
                    'html_content': page.get('body', {}).get('storage', {}).get('value', ''),
                    'size': len(page.get('body', {}).get('storage', {}).get('value', ''))
                }
                
                print(f"✅ Retrieved page content: {page_content['size']} characters")
                return page_content
            else:
                print(f"❌ Page not found: {page_title}")
                return None
        else:
            print(f"❌ Failed to retrieve page content: HTTP {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error retrieving page content: {e}")
        return None

def main(story_id, wiki_title=None, product_name=None):
    """Main function - with user-specified wiki title and product name search"""
    
    print(f"\n🚀 Processing Story: {story_id}")
    if wiki_title:
        print(f"📖 Wiki Title: {wiki_title}")
    if product_name:
        print(f"🏷️ Product: {product_name}")
    print("=" * 50)
    
    # Step 1: Get JIRA story information
    print("\n1️⃣ Getting JIRA story information...")
    try:
        story = get_story(story_id)
        print(f"✅ Story: {story['summary'][:50]}...")
    except Exception as e:
        print(f"❌ JIRA Error: {e}")
        return
    
    # Step 2: Get related defects
    print("\n2️⃣ Getting related defects...")
    try:
        defects = get_related_defects(story)
        print(f"✅ Found {len(defects)} related defects")
    except Exception as e:
        print(f"❌ Defects Error: {e}")
        defects = []
    
    # Step 3: Search  Global Wiki
    if wiki_title and product_name:
        print(f"\n3️⃣ Searching  Global Wiki by user-specified title and product...")
        try:
            wiki_pages = search_wiki_by_title_and_product(wiki_title, product_name)
            print(f"✅ Found {len(wiki_pages)} Wiki pages matching title and product criteria")
        except Exception as e:
            print(f"❌ Wiki Error: {e}")
            wiki_pages = []
    elif wiki_title:
        print(f"\n3️⃣ Searching  Global Wiki by user-specified title...")
        try:
            wiki_pages = search_wiki_by_term(wiki_title)
            # Add relevance scoring for title-only search
            for page in wiki_pages:
                page['relevance_score'] = calculate_title_relevance(page, wiki_title)
            wiki_pages.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
            print(f"✅ Found {len(wiki_pages)} Wiki pages matching title")
        except Exception as e:
            print(f"❌ Wiki Error: {e}")
            wiki_pages = []
    else:
        # Fallback to feature-based search
        print("\n3️⃣ Extracting feature names and searching wiki...")
        try:
            feature_names = extract_feature_name(story)
            print(f"   Will search for features: {', '.join(feature_names)}")
            wiki_pages = search_wiki_by_feature(story_id, feature_names)
            print(f"✅ Found {len(wiki_pages)} Wiki pages using feature search")
        except Exception as e:
            print(f"❌ Wiki Error: {e}")
            wiki_pages = []
    
    # Step 5: Get full content from the best matching page
    best_page_content = None
    if wiki_pages:
        print("\n5️⃣ Getting full content from best matching page...")
        best_page = wiki_pages[0]  # Highest relevance score
        print(f"📖 Best match: {best_page['title']} (Score: {best_page.get('relevance_score', 0)})")
        
        try:
            best_page_content = get_page_content_by_title(best_page['title'])
            if best_page_content:
                print(f"✅ Retrieved {best_page_content['size']} characters of content")
            else:
                print("❌ Could not retrieve page content")
        except Exception as e:
            print(f"❌ Error getting page content: {e}")
    else:
        print("\n5️⃣ No wiki pages found to retrieve content from")
    
    # Step 4: Save comprehensive report with JIRA, defects, and wiki content
    print("\n4️⃣ Saving comprehensive report to file...")
    try:
        saved_file = save_comprehensive_content(story_id, story, defects, best_page_content, wiki_title, product_name)
        print(f"✅ Saved to: {saved_file}")
    except Exception as e:
        print(f"❌ Save Error: {e}")
        saved_file = None
    
    print("\n🎉 Done!")
    return saved_file

if __name__ == "__main__":
    # Simple execution with user inputs
    story_id = "TC-40474"  # Default story ID
    
    print("Simple JIRA +  Wiki Integration")
    print("===================================")
    
    try:
        # Get credentials first
        get_credentials()
        
        # Ask user for story ID
        user_story = input(f"\nEnter story ID (press Enter for {story_id}): ").strip()
        if user_story:
            story_id = user_story
        
        # Ask user for wiki page title
        wiki_title = input("Enter Wiki Page Title (optional, press Enter to skip): ").strip()
        if not wiki_title:
            wiki_title = None
        
        # Ask user for product name
        product_name = input("Enter Product Name (optional, press Enter to skip): ").strip()
        if not product_name:
            product_name = None
        
        # Show what will be searched
        print(f"\n🔍 Search Configuration:")
        print(f"   JIRA Story: {story_id}")
        print(f"   Wiki Title: {wiki_title if wiki_title else 'Auto-detect from story'}")
        print(f"   Product: {product_name if product_name else 'Not specified'}")
        
        result = main(story_id, wiki_title, product_name)
        
        if result:
            print(f"\n📄 Output file: {result}")
            
            # Ask if user wants to open the file
            open_file = input("\nOpen the file? (y/n): ").strip().lower()
            if open_file in ['y', 'yes']:
                os.system(f'notepad.exe "{result}"')
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nPlease check:")
        print("1. Your JIRA credentials are correct")
        print("2. Your Wiki credentials/API token are valid")
        print("3. Your network connectivity")
        print("4. The JIRA server URL (https://jira)")
        print("5. The Wiki URL (https://wiki.com/)")
