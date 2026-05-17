import { test } from '../../fixtures/test.fixture';
import { APIClient } from '../../api/APIClient';
import { apiConfig } from '../../config/config';

test.describe('API Tests', () => {
  let apiClient: APIClient;

  test.beforeEach(async () => {
    apiClient = new APIClient(apiConfig.baseUrl, apiConfig.timeout);
    if (apiConfig.authToken) {
      apiClient.setAuthToken(apiConfig.authToken);
    }
  });

  test('Should get users list successfully', async () => {
    // Arrange
    const endpoint = '/users';

    // Act
    const response = await apiClient.get(endpoint);

    // Assert
    const status = response.status;
    const data = response.data;

    console.log('Response Status:', status);
    console.log('Response Data:', data);

    // Verify response
    test.expect(status).toBe(200);
    test.expect(Array.isArray(data)).toBe(true);
  });

  test('Should create a new user', async () => {
    // Arrange
    const endpoint = '/users';
    const userData = {
      name: 'Test User',
      email: 'testuser@example.com',
      age: 25,
    };

    // Act
    const response = await apiClient.post(endpoint, userData);

    // Assert
    test.expect(response.status).toBe(201);
    test.expect(response.data).toHaveProperty('id');
    test.expect((response.data as any).email).toBe(userData.email);
  });

  test('Should get user by ID', async () => {
    // Arrange
    const userId = 1;
    const endpoint = `/users/${userId}`;

    // Act
    const response = await apiClient.get(endpoint);

    // Assert
    test.expect(response.status).toBe(200);
    test.expect(response.data).toHaveProperty('id', userId);
  });

  test('Should update user', async () => {
    // Arrange
    const userId = 1;
    const endpoint = `/users/${userId}`;
    const updatedData = {
      name: 'Updated User',
    };

    // Act
    const response = await apiClient.put(endpoint, updatedData);

    // Assert
    test.expect(response.status).toBe(200);
    test.expect((response.data as any).name).toBe(updatedData.name);
  });

  test('Should delete user', async () => {
    // Arrange
    const userId = 1;
    const endpoint = `/users/${userId}`;

    // Act
    const response = await apiClient.delete(endpoint);

    // Assert
    test.expect(response.status).toBe(204);
  });

  test('Should verify API response contains expected data', async () => {
    // Arrange
    const endpoint = '/users/1';
    const expectedData = {
      id: 1,
      email: 'test@example.com',
    };

    // Act & Assert
    const isValid = await apiClient.verifyResponseData(endpoint, expectedData);
    test.expect(isValid).toBe(true);
  });
});
