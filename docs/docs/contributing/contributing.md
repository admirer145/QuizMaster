---
sidebar_position: 1
title: Contributing Guide
---

# Contributing to QuizMaster

Thank you for your interest in contributing to QuizMaster! This guide will help you get started.

## Code of Conduct

Please read and follow our [Code of Conduct](https://github.com/Govin25/QuizMaster/blob/main/CODE_OF_CONDUCT.md).

## Getting Started

### 1. Fork the Repository

1. Visit [QuizMaster on GitHub](https://github.com/Govin25/QuizMaster)
2. Click the **Fork** button in the top right
3. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/QuizMaster.git
cd QuizMaster
```

### 2. Set Up Development Environment

Follow the [Installation Guide](/docs/getting-started/installation) to set up your local environment.

### 3. Create a Branch

Create a new branch for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
```

**Branch Naming Conventions:**

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

## Development Workflow

### Making Changes

1. **Make your changes** in your feature branch
2. **Follow code style guidelines** (see below)
3. **Test your changes** thoroughly
4. **Commit your changes** with clear messages

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
git commit -m "feat(quiz): add AI quiz generation from documents"
git commit -m "fix(auth): resolve JWT token expiration issue"
git commit -m "docs(api): update authentication API documentation"
```

### Running Tests

Before submitting your changes, ensure all tests pass:

```bash
# Run frontend linter
cd client
npm run lint

# Run backend tests (when available)
cd server
npm test
```

## Code Style Guidelines

### JavaScript/React

- Use **ES6+ syntax**
- Use **functional components** with hooks
- Use **const** and **let** (avoid var)
- Use **arrow functions** for callbacks
- Follow **ESLint** rules (configured in project)

**Example:**

```javascript
// Good
const MyComponent = ({ title, onSubmit }) => {
  const [value, setValue] = useState('');
  
  const handleSubmit = () => {
    onSubmit(value);
  };
  
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

// Avoid
function MyComponent(props) {
  var value = '';
  // ...
}
```

### CSS

- Use **meaningful class names**
- Follow **BEM naming convention** where appropriate
- Keep styles **modular** and **reusable**
- Use **CSS variables** for colors and common values

### File Organization

- Keep files **focused** and **single-purpose**
- Use **descriptive file names**
- Group related files in directories
- Export from index files when appropriate

## Submitting Changes

### 1. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 2. Create a Pull Request

1. Go to your fork on GitHub
2. Click **New Pull Request**
3. Select your feature branch
4. Fill in the PR template:
   - **Title**: Clear, descriptive title
   - **Description**: What changes you made and why
   - **Related Issues**: Link any related issues
   - **Screenshots**: Include screenshots for UI changes

### 3. PR Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged!

## What to Contribute

### Good First Issues

Look for issues labeled `good first issue` on GitHub. These are great for new contributors!

### Areas for Contribution

- **Features**: New quiz types, analytics features, UI improvements
- **Bug Fixes**: Fix reported bugs or issues you discover
- **Documentation**: Improve or expand documentation
- **Tests**: Add test coverage
- **Performance**: Optimize queries, caching, rendering
- **Accessibility**: Improve accessibility features

### Feature Requests

Before working on a major feature:

1. **Check existing issues** to avoid duplication
2. **Open an issue** to discuss the feature
3. **Wait for approval** from maintainers
4. **Start development** once approved

## Documentation Contributions

### Adding Documentation

Documentation is built with Docusaurus. To add new documentation:

1. Create a new `.md` file in the appropriate directory:
   - `docs/getting-started/` - Getting started guides
   - `docs/user-guide/` - User-facing documentation
   - `docs/developer-guide/` - Developer documentation
   - `docs/api/` - API reference
   - `docs/deployment/` - Deployment guides

2. Add frontmatter:

```markdown
---
sidebar_position: 1
title: Your Page Title
---

# Your Page Title

Your content here...
```

3. Update `sidebars.ts` if needed (or use auto-generation)

4. Test locally:

```bash
cd docs
npm start
```

### Documentation Style Guide

- Use **clear, concise language**
- Include **code examples**
- Add **screenshots** for UI features
- Use **admonitions** for important notes:

```markdown
:::tip
This is a helpful tip!
:::

:::warning
This is a warning!
:::

:::info
This is informational.
:::
```

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:

```bash
# Frontend (Vite)
cd client
npm run dev

# Backend (nodemon - if configured)
cd server
npm run dev
```

### Debugging

- Use **browser DevTools** for frontend debugging
- Use **console.log** or **debugger** statements
- Check **Network tab** for API calls
- Review **server logs** for backend issues

### Database Changes

If you modify the database schema:

1. Create a new migration:

```bash
cd server
npm run migration:create -- --name your-migration-name
```

2. Update the migration file
3. Run migrations:

```bash
npm run migrate
```

4. Update seed data if needed

## Getting Help

- **Documentation**: Check the [Developer Guide](/docs/developer-guide/architecture)
- **GitHub Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions

## License

By contributing to QuizMaster, you agree that your contributions will be licensed under the [MIT License](https://github.com/Govin25/QuizMaster/blob/main/LICENSE).

## Thank You!

Your contributions make QuizMaster better for everyone. Thank you for taking the time to contribute! 🎉
