const mysql = require('mysql');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ms_system',
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = (callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
      callback(false);
      return;
    }
    
    console.log('✅ Database connected successfully!');
    connection.release();
    callback(true);
  });
};

// Initialize database tables
const initDatabase = (callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
      callback(false);
      return;
    }

    // Create tables if they don't exist
    const createTables = `
      -- Roles table
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        role_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
      );

      -- Centers table
      CREATE TABLE IF NOT EXISTS centers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        field VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      -- Projects table
      CREATE TABLE IF NOT EXISTS projects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        center_id INT,
        project_status ENUM('planning', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'planning',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE
      );

      -- Staff table
      CREATE TABLE IF NOT EXISTS staff (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        birth_date DATE,
        gender ENUM('male', 'female', 'other') NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        description TEXT,
        center_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE SET NULL
      );

      -- Project Members table
      CREATE TABLE IF NOT EXISTS project_members (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_id INT NOT NULL,
        staff_id INT NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
        UNIQUE KEY unique_project_staff (project_id, staff_id)
      );
    `;

    // Split and execute each CREATE TABLE statement
    const statements = createTables.split(';').filter(stmt => stmt.trim());
    let completedStatements = 0;
    
    const executeNextStatement = (index) => {
      if (index >= statements.length) {
        // All statements completed, insert default data
        insertDefaultData();
        return;
      }
      
      const statement = statements[index].trim();
      if (statement) {
        connection.query(statement, (err) => {
          if (err) {
            console.error('❌ Error creating table:', err.message);
            connection.release();
            callback(false);
            return;
          }
          completedStatements++;
          executeNextStatement(index + 1);
        });
      } else {
        executeNextStatement(index + 1);
      }
    };

    const insertDefaultData = () => {
      // Insert default roles if they don't exist
      connection.query(`
        INSERT IGNORE INTO roles (name) VALUES 
        ('admin'), ('manager'), ('staff'), ('member')
      `, (err) => {
        if (err) {
          console.error('❌ Error inserting roles:', err.message);
          connection.release();
          callback(false);
          return;
        }

        // Insert default admin user if it doesn't exist
        const bcrypt = require('bcryptjs');
        bcrypt.hash('admin123', 12, (hashErr, hashedPassword) => {
          if (hashErr) {
            console.error('❌ Error hashing password:', hashErr.message);
            connection.release();
            callback(false);
            return;
          }

          connection.query(`
            INSERT IGNORE INTO users (name, password, role_id) 
            SELECT 'admin', ?, id FROM roles WHERE name = 'admin'
          `, [hashedPassword], (insertErr) => {
            if (insertErr) {
              console.error('❌ Error inserting admin user:', insertErr.message);
              connection.release();
              callback(false);
              return;
            }

            connection.release();
            console.log('✅ Database tables initialized successfully!');
            callback(true);
          });
        });
      });
    };

    // Start executing statements
    executeNextStatement(0);
  });
};

// Helper function to execute queries with promises
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  pool,
  query,
  testConnection,
  initDatabase
}; 