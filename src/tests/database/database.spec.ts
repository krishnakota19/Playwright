import { test } from '../../fixtures/test.fixture';
import { DatabaseClient } from '../../database/DatabaseClient';
import { dbConfig } from '../../config/config';

test.describe('Database Tests', () => {
  let dbClient: DatabaseClient;

  test.beforeAll(async () => {
    dbClient = new DatabaseClient(dbConfig);
    await dbClient.connect();
  });

  test.afterAll(async () => {
    await dbClient.close();
  });

  test('Should fetch users from database', async () => {
    // Arrange
    const query = 'SELECT * FROM users';

    // Act
    const users = await dbClient.query(query);

    // Assert
    console.log('Users from DB:', users);
    test.expect(Array.isArray(users)).toBe(true);
  });

  test('Should fetch single user by ID', async () => {
    // Arrange
    const userId = 1;
    const query = 'SELECT * FROM users WHERE id = ?';

    // Act
    const user = await dbClient.queryOne(query, [userId]);

    // Assert
    console.log('User:', user);
    test.expect(user).toBeDefined();
    if (user) {
      test.expect(user.id).toBe(userId);
    }
  });

  test('Should insert new user', async () => {
    // Arrange
    const query =
      "INSERT INTO users (name, email, age) VALUES (?, ?, ?)";
    const values = ['Test User', 'test@example.com', 25];

    // Act
    const result = await dbClient.execute(query, values);

    // Assert
    console.log('Insert result:', result);
    test.expect(result).toBeDefined();
  });

  test('Should update user data', async () => {
    // Arrange
    const query = 'UPDATE users SET name = ? WHERE id = ?';
    const values = ['Updated User', 1];

    // Act
    const result = await dbClient.execute(query, values);

    // Assert
    test.expect(result).toBeDefined();
  });

  test('Should verify user exists in database', async () => {
    // Arrange
    const table = 'users';
    const condition = { id: 1 };

    // Act
    const exists = await dbClient.rowExists(table, condition);

    // Assert
    test.expect(exists).toBe(true);
  });

  test('Should verify user data in database', async () => {
    // Arrange
    const table = 'users';
    const where = { id: 1 };
    const expectedData = {
      email: 'test@example.com',
    };

    // Act
    const isValid = await dbClient.verifyRowData(table, where, expectedData);

    // Assert
    test.expect(isValid).toBe(true);
  });

  test('Should count users in database', async () => {
    // Arrange
    const table = 'users';

    // Act
    const count = await dbClient.countRows(table);

    // Assert
    console.log('Total users:', count);
    test.expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Should delete user from database', async () => {
    // Arrange
    const query = 'DELETE FROM users WHERE id = ?';
    const values = [1];

    // Act
    const result = await dbClient.execute(query, values);

    // Assert
    test.expect(result).toBeDefined();
  });
});
