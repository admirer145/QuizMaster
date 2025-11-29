# Adding New Documentation to QuizMaster

This guide explains how to add new documentation pages to the QuizMaster documentation site.

## Quick Start

### 1. Create a New Documentation File

Create a new `.md` file in the appropriate directory:

```bash
cd docs/docs

# For user guides
touch user-guide/my-new-feature.md

# For developer guides
touch developer-guide/my-new-component.md

# For API documentation
touch api/my-new-api.md
```

### 2. Add Frontmatter

Every documentation page needs frontmatter at the top:

```markdown
---
sidebar_position: 3
title: My New Feature
---

# My New Feature

Your content here...
```

**Frontmatter Fields:**
- `sidebar_position`: Order in the sidebar (1, 2, 3, etc.)
- `title`: Page title (shown in browser tab and sidebar)

### 3. Write Your Content

Use standard Markdown syntax:

```markdown
## Heading 2

### Heading 3

Regular paragraph text.

**Bold text** and *italic text*.

- Bullet point 1
- Bullet point 2

1. Numbered list
2. Another item

[Link text](https://example.com)

![Image alt text](/img/screenshot.png)
```

### 4. Add Code Examples

Use fenced code blocks with language specification:

````markdown
```javascript
const example = 'code';
console.log(example);
```

```bash
npm install
npm start
```
````

### 5. Use Admonitions

Highlight important information:

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

:::danger
This is dangerous!
:::
```

### 6. Update Sidebar (Optional)

The sidebar is auto-generated from the file structure, but you can customize it in `sidebars.ts`:

```typescript
{
  type: 'category',
  label: 'User Guide',
  items: [
    'user-guide/authentication',
    'user-guide/my-new-feature',  // Add your page here
  ],
}
```

### 7. Test Locally

Start the dev server to preview your changes:

```bash
cd docs
npm start
```

Open [http://localhost:3000](http://localhost:3000) and navigate to your new page.

### 8. Build and Verify

Before committing, build the site to check for errors:

```bash
npm run build
```

Fix any broken links or errors that appear.

## Documentation Structure

```
docs/docs/
├── intro.md                    # Introduction page
├── getting-started/            # Getting started guides
│   ├── installation.md
│   └── quick-start.md
├── user-guide/                 # User-facing documentation
│   ├── authentication.md
│   ├── quiz-hub.md
│   ├── creating-quizzes.md
│   ├── taking-quizzes.md
│   ├── analytics.md
│   └── data-privacy.md
├── developer-guide/            # Developer documentation
│   ├── architecture.md
│   ├── frontend.md
│   ├── backend.md
│   ├── database.md
│   └── testing.md
├── api/                        # API reference
│   ├── authentication-api.md
│   ├── quizzes-api.md
│   ├── results-api.md
│   ├── leaderboard-api.md
│   └── legal-api.md
├── deployment/                 # Deployment guides
│   ├── vercel.md
│   └── production.md
└── contributing/               # Contributing guidelines
    └── contributing.md
```

## Best Practices

### 1. Use Clear Titles

```markdown
# Authentication API  ✅
# Auth Stuff  ❌
```

### 2. Include Examples

Always include code examples for technical documentation:

```markdown
**Example Request:**

\`\`\`bash
curl -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"johndoe","password":"pass123"}'
\`\`\`
```

### 3. Link to Related Pages

Help users navigate:

```markdown
See also:
- [Authentication](./authentication.md)
- [API Reference](/docs/api/authentication-api)
```

### 4. Use Tables for Structured Data

```markdown
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/auth/login | POST | User login |
| /api/auth/signup | POST | User signup |
```

### 5. Add Diagrams with Mermaid

```markdown
\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`
```

## Advanced Features

### Custom React Components

You can use React components in MDX files:

```mdx
import MyComponent from '@site/src/components/MyComponent';

<MyComponent prop="value" />
```

### Tabs

```markdown
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="npm" label="npm">
    \`\`\`bash
    npm install
    \`\`\`
  </TabItem>
  <TabItem value="yarn" label="Yarn">
    \`\`\`bash
    yarn install
    \`\`\`
  </TabItem>
</Tabs>
```

### Code Block Features

```markdown
\`\`\`javascript title="example.js" showLineNumbers
// This is line 1
const example = 'code';
console.log(example);
\`\`\`
```

## Deployment

### Automatic Deployment

When you push to the main branch, the documentation will automatically deploy (if configured with Vercel/Netlify).

### Manual Deployment

```bash
# Build
npm run build

# The build/ directory contains static files ready for deployment
```

## Troubleshooting

### Broken Links

If you see broken link errors during build:

1. Check that all internal links use correct paths
2. Verify file names match exactly (case-sensitive)
3. Use relative paths for same-directory links: `./page.md`
4. Use absolute paths for cross-directory links: `/docs/section/page`

### Build Errors

Common issues:

- **Missing frontmatter**: Every page needs frontmatter
- **Invalid Markdown**: Check syntax errors
- **Duplicate sidebar positions**: Each page needs unique position
- **Missing images**: Ensure images exist in `static/img/`

## Resources

- [Docusaurus Documentation](https://docusaurus.io/docs)
- [Markdown Guide](https://www.markdownguide.org/)
- [Mermaid Diagrams](https://mermaid.js.org/)

## Need Help?

- Check existing documentation for examples
- Review the [Docusaurus docs](https://docusaurus.io/docs)
- Ask in GitHub Discussions
