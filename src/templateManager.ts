import * as vscode from 'vscode';

export interface TemplateSnippet {
  id: string;
  name: string;
  language: string;
  description: string;
  content: string;
  category: string;
}

export class TemplateManager {
  private templates: Map<string, TemplateSnippet[]> = new Map();

  constructor() {
    this.initializeBuiltInTemplates();
  }

  private initializeBuiltInTemplates(): void {
    // JavaScript/TypeScript Templates
    this.addTemplate({
      id: 'js-basic',
      name: 'Basic JavaScript',
      language: 'javascript',
      description: 'Basic JavaScript function template',
      content: `// Basic JavaScript function
function myFunction() {
  // Your code here
}

myFunction();`,
      category: 'Basic'
    });

    this.addTemplate({
      id: 'js-async',
      name: 'Async Function',
      language: 'javascript',
      description: 'Async/await function template',
      content: `// Async function example
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Error fetching data: ' + error);
  }
}

fetchData();`,
      category: 'Async'
    });

    this.addTemplate({
      id: 'js-class',
      name: 'ES6 Class',
      language: 'javascript',
      description: 'ES6 class template',
      content: `// ES6 Class example
class MyClass {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return \`Hello, \${this.name}!\`;
  }

  static create(name) {
    return new MyClass(name);
  }
}

const instance = MyClass.create('World');
const greeting = instance.greet();
// Use the greeting value`,
      category: 'OOP'
    });

    this.addTemplate({
      id: 'js-react-component',
      name: 'React Component',
      language: 'javascript',
      description: 'React functional component template',
      content: `import React, { useState, useEffect } from 'react';

const MyComponent = ({ title }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};

export default MyComponent;`,
      category: 'React'
    });

    // TypeScript Templates
    this.addTemplate({
      id: 'ts-interface',
      name: 'TypeScript Interface',
      language: 'typescript',
      description: 'TypeScript interface and implementation',
      content: `// TypeScript interface example
interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean;
}

interface UserService {
  getUser(id: number): Promise<User>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
}

class ApiUserService implements UserService {
  async getUser(id: number): Promise<User> {
    // Implementation here
    return {
      id,
      name: 'John Doe',
      email: 'john@example.com',
      isActive: true
    };
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    // Implementation here
    return {
      id: Date.now(),
      ...user
    };
  }
}`,
      category: 'Types'
    });

    // Python Templates
    this.addTemplate({
      id: 'py-basic',
      name: 'Basic Python',
      language: 'python',
      description: 'Basic Python function template',
      content: `# Basic Python function
def greet(name):
    """Greet someone by name."""
    return f"Hello, {name}!"

def main():
    name = "World"
    message = greet(name)
    print(message)

if __name__ == "__main__":
    main()`,
      category: 'Basic'
    });

    this.addTemplate({
      id: 'py-class',
      name: 'Python Class',
      language: 'python',
      description: 'Python class template',
      content: `# Python class example
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Hello, I'm {self.name} and I'm {self.age} years old."
    
    def have_birthday(self):
        self.age += 1
        print(f"Happy birthday! {self.name} is now {self.age} years old.")
    
    def __str__(self):
        return f"Person(name='{self.name}', age={self.age})"

# Usage example
person = Person("Alice", 30)
print(person.greet())
person.have_birthday()
print(person)`,
      category: 'OOP'
    });

    this.addTemplate({
      id: 'py-async',
      name: 'Async Python',
      language: 'python',
      description: 'Async/await Python template',
      content: `import asyncio
import aiohttp

async def fetch_data(url):
    """Fetch data from a URL asynchronously."""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()

async def main():
    """Main async function."""
    urls = [
        'https://jsonplaceholder.typicode.com/posts/1',
        'https://jsonplaceholder.typicode.com/posts/2',
        'https://jsonplaceholder.typicode.com/posts/3'
    ]
    
    # Fetch all URLs concurrently
    tasks = [fetch_data(url) for url in urls]
    results = await asyncio.gather(*tasks)
    
    for i, result in enumerate(results, 1):
        print(f"Post {i}: {result['title']}")

if __name__ == "__main__":
    asyncio.run(main())`,
      category: 'Async'
    });

    this.addTemplate({
      id: 'py-data-analysis',
      name: 'Data Analysis',
      language: 'python',
      description: 'Python data analysis template',
      content: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Sample data analysis template
def analyze_data():
    """Analyze sample data."""
    # Create sample data
    data = {
        'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
        'age': [25, 30, 35, 28, 32],
        'salary': [50000, 60000, 70000, 55000, 65000],
        'department': ['IT', 'HR', 'IT', 'Finance', 'IT']
    }
    
    df = pd.DataFrame(data)
    
    # Basic statistics
    print("Dataset Info:")
    print(df.info())
    print("\\nBasic Statistics:")
    print(df.describe())
    
    # Group by department
    dept_stats = df.groupby('department').agg({
        'age': 'mean',
        'salary': ['mean', 'min', 'max']
    })
    print("\\nDepartment Statistics:")
    print(dept_stats)
    
    # Simple visualization
    plt.figure(figsize=(10, 6))
    plt.scatter(df['age'], df['salary'])
    plt.xlabel('Age')
    plt.ylabel('Salary')
    plt.title('Age vs Salary')
    plt.grid(True)
    plt.show()

if __name__ == "__main__":
    analyze_data()`,
      category: 'Data Science'
    });

    // HTML Templates
    this.addTemplate({
      id: 'html-basic',
      name: 'Basic HTML',
      language: 'html',
      description: 'Basic HTML page template',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to My Page</h1>
        <p>This is a basic HTML template.</p>
        <button onclick="alert('Hello World!')">Click Me</button>
    </div>
</body>
</html>`,
      category: 'Web'
    });

    // CSS Templates
    this.addTemplate({
      id: 'css-flexbox',
      name: 'Flexbox Layout',
      language: 'css',
      description: 'CSS Flexbox layout template',
      content: `/* Flexbox Layout Template */
.container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.item {
  flex: 1;
  min-width: 200px;
  padding: 20px;
  background: #f0f0f0;
  border-radius: 8px;
  text-align: center;
}

.item:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  
  .item {
    min-width: 100%;
  }
}`,
      category: 'Layout'
    });

    // JSON Templates
    this.addTemplate({
      id: 'json-api',
      name: 'API Response',
      language: 'json',
      description: 'JSON API response template',
      content: `{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "profile": {
          "avatar": "https://example.com/avatar1.jpg",
          "bio": "Software Developer",
          "location": "New York, NY"
        },
        "preferences": {
          "theme": "dark",
          "notifications": true,
          "language": "en"
        }
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "profile": {
          "avatar": "https://example.com/avatar2.jpg",
          "bio": "UX Designer",
          "location": "San Francisco, CA"
        },
        "preferences": {
          "theme": "light",
          "notifications": false,
          "language": "en"
        }
      }
    ]
  },
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 25,
    "total_pages": 3
  },
  "timestamp": "2025-07-07T10:30:00Z"
}`,
      category: 'API'
    });

    // Markdown Templates
    this.addTemplate({
      id: 'md-readme',
      name: 'README Template',
      language: 'markdown',
      description: 'README.md template',
      content: `# Project Name

Brief description of what this project does and who it's for.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Usage

\`\`\`javascript
const project = require('project-name');

// Example usage
project.doSomething();
\`\`\`

## API Reference

### \`doSomething()\`

Description of what this function does.

**Parameters:**
- \`param1\` (string): Description of parameter

**Returns:**
- \`result\` (object): Description of return value

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

- Author: Your Name
- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)
`,
      category: 'Documentation'
    });

    // SQL Templates
    this.addTemplate({
      id: 'sql-crud',
      name: 'CRUD Operations',
      language: 'sql',
      description: 'Basic CRUD operations template',
      content: `-- CRUD Operations Example
-- Create table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create (Insert) data
INSERT INTO users (name, email) VALUES 
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com'),
    ('Bob Johnson', 'bob@example.com');

-- Read (Select) data
SELECT * FROM users;

SELECT id, name, email 
FROM users 
WHERE created_at >= '2025-01-01'
ORDER BY name;

-- Update data
UPDATE users 
SET name = 'John Smith', 
    updated_at = CURRENT_TIMESTAMP 
WHERE id = 1;

-- Delete data
DELETE FROM users 
WHERE email = 'bob@example.com';

-- Advanced queries
SELECT 
    COUNT(*) as total_users,
    DATE(created_at) as signup_date
FROM users 
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;`,
      category: 'Database'
    });
  }

  private addTemplate(template: TemplateSnippet): void {
    if (!this.templates.has(template.language)) {
      this.templates.set(template.language, []);
    }
    this.templates.get(template.language)!.push(template);
  }

  public getTemplatesForLanguage(language: string): TemplateSnippet[] {
    return this.templates.get(language) || [];
  }

  public getAllTemplates(): TemplateSnippet[] {
    const allTemplates: TemplateSnippet[] = [];
    for (const templates of this.templates.values()) {
      allTemplates.push(...templates);
    }
    return allTemplates;
  }

  public getTemplateById(id: string): TemplateSnippet | undefined {
    for (const templates of this.templates.values()) {
      const template = templates.find(t => t.id === id);
      if (template) {
        return template;
      }
    }
    return undefined;
  }

  public getAvailableLanguages(): string[] {
    return Array.from(this.templates.keys()).sort();
  }

  public getTemplatesByCategory(category: string): TemplateSnippet[] {
    const templates: TemplateSnippet[] = [];
    for (const languageTemplates of this.templates.values()) {
      templates.push(...languageTemplates.filter(t => t.category === category));
    }
    return templates;
  }

  public getAvailableCategories(): string[] {
    const categories = new Set<string>();
    for (const templates of this.templates.values()) {
      templates.forEach(t => categories.add(t.category));
    }
    return Array.from(categories).sort();
  }

  // Implements the dispose method to make this class disposable
  public dispose(): void {
    // Clean up resources if needed
    this.templates.clear();
  }
}
