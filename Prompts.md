Prompt to use: I would like you to act as an experienced QA with strong knowledge of coding and best practices of coding. I am seeking your support in generating test cases against a code change made in our application by a developer. In order to generate test cases please follow the below guidelines, if anything is still not clear to you, please clarify it before generating the test cases.
1. Generate test cases which covers both positive and negative scenarios. If needed please generate multiple test cases varied by test data to cover different positive and negative scenarios.
2. Make sure you generate test case which goes the error handing (catch block) of changed code. If there is no catch block in code, then suggest test cases which needs to be handled in catch block.
3. Suggest test cases covering non-functional aspects. For example, concurrency.
4. Make sure the test cases are relevant to given code and should not be designed based on your assumption.
5. Generate the test cases in tabular format.


Prompt to Use: I would like you to act as a QA (Software Tester) and would request you to follow the below guidelines to verify the correctness of a piece of code provided by me.

Objective: Verify the correctness the given code. Identify potential edge cases, handle exceptional scenarios, and ensure the code meets the specified requirements. Additionally suggest me a list of test cases which I should be verifying against the provided code. Here are the instructions to verify the code:
1. Code Understanding: Provide very high-level explanation and the purpose of code.
2. Input Validation: Test the code with various valid, invalid, naughty strings, Unicode characters, etc. to ensure the expected behavior. Please highlight the input which is not handled gracefully by the code.
3. Boundary Cases: Test with minimum, maximum possible input value and relevant variables.
4. Exception Handling: Intentionally trigger exceptions and errors to confirm the effectiveness of exception handling.
5. Suggest if there is non-functional issue with the code, example check memory leakages, assess if code is suitable for multithreading.
6. Security Considerations: Check for basic security consideration and highlight if there is any potential vulnerabilities like SQL injection, cross-site scripting etc.

Additional Information:
– Suggest if there is any additional information, limitation or suggestion to improve the provided code.
– Suggest overall assessment of code and readability and maintainability.
– Suggest different test cases including edge cases which I should perform to assess the code change in detail.



Prompt to Use: I am seeking your support in generating a comprehensive set of test data to thoroughly assess the input field’s resilience and functionality. Include variations in case sensitivity, testing inputs with both uppercase and lowercase characters (e.g., “Test Input” and “testinput”). Introduce leading and trailing whitespaces to evaluate the system’s handling of spaces around inputs (e.g., ” Input123 “). Test the input field with a mix of characters, including alphanumeric and special characters (e.g., “Input@123”). Explore numeric-only (e.g., “123456”) and alphabetic-only inputs (e.g., “AlphaString”). Assess the system’s behavior with inputs at both the maximum and minimum allowed lengths. Test the input field’s response to an empty input and evaluate how it handles duplicate entries. Introduce naughty strings like (Powerلُلُصّبُلُلصّبُررً ॣ ॣh ॣ ॣ冗), unicode characters, and Latin characters to assess the system’s security and internationalisation aspects. Include edge cases, such as null characters and potential injection attempts (e.g., “<script>alert(‘XSS’)</script>”).

Generate test data for input field <input-field> in tabular format.



Prompt to Use: Write a utility function in [Java or you chosen language] to generate a future date from the current date. The function should take an input parameter, ‘numberOfDays’ (N), representing the number of days to be added to today’s date. The output should be a date string formatted as YYYY-DD-MM. Implement the function to accurately calculate the future date by adding the specified number of days to the current date. Ensure that the function handles edge cases appropriately and adheres to the specified date format.


Create a performance test plan for [application or feature] based on my design documents, requirements, and recent QA notes. Include objectives, scope, environment setup, tools, metrics (response time, throughput, error rate), and success criteria. Then generate detailed test scenarios for peak load, stress, endurance, and scalability. Flag any missing inputs and suggest assumptions. Make sure the output is clear and actionable.



Create a functional test plan for [release or feature] using my requirements, design documents, and recent QA notes. Include objectives, scope, test environment, tools, and success criteria, matching [format]. Then generate comprehensive test scenarios covering positive, negative, and edge cases. Suggest any missing inputs and assumptions. Make sure the output is clear, actionable, and formatted for easy execution.



Analyze my latest security and compliance scan results for [application or system]. Auto-generate a list of defects, rank them by severity and business impact, and suggest remediation steps for each. Include references to relevant policies or standards (e.g., PCI, GDPR). Flag any missing context and propose assumptions. Make sure the output is clear, structured, and ready for review.
<img width="1585" height="2652" alt="image" src="https://github.com/user-attachments/assets/cb7ad78b-7653-4a3d-bd9a-e77b4df1bd7f" />
