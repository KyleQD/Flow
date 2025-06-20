# Tourify Architecture Documentation

This directory contains architectural documentation for the Tourify application, including various diagrams that help visualize different aspects of the system.

## Architecture Diagrams

The main architecture diagrams are contained in `architecture.mmd`. This is a Mermaid markdown file that can be rendered using any Mermaid-compatible viewer.

### Included Diagrams

1. **High-Level Architecture**
   - Shows the three main layers of the application
   - Illustrates key technologies used in each layer
   - Demonstrates data flow between layers

2. **Application Features**
   - Mind map of all major features
   - Hierarchical breakdown of functionality
   - Shows feature relationships and groupings

3. **Authentication Flow**
   - Sequence diagram of the authentication process
   - Shows interaction between different system components
   - Illustrates both successful and failed auth scenarios

4. **Database Schema Relationships**
   - Entity-Relationship diagram of the database
   - Shows relationships between major entities
   - Includes cardinality of relationships

5. **Documents Component Hierarchy**
   - Component tree for the documents feature
   - Shows parent-child relationships
   - Includes all major UI components

## How to View

You can view these diagrams in several ways:

1. **VS Code**:
   - Install the "Markdown Preview Mermaid Support" extension
   - Open `architecture.mmd`
   - Use the "Preview" feature

2. **Mermaid Live Editor**:
   - Visit [Mermaid Live Editor](https://mermaid.live)
   - Copy and paste the content from `architecture.mmd`

3. **GitHub**:
   - GitHub natively supports Mermaid diagrams in markdown
   - View the file directly on GitHub

## How to Update

To update or add new diagrams:

1. Edit `architecture.mmd`
2. Follow the existing format and commenting style
3. Add new sections with `%% Section Name` comments
4. Test the diagrams using one of the viewing methods above
5. Commit changes and update this README if adding new diagram types

## Best Practices

When modifying diagrams:

- Keep diagrams focused and not too complex
- Use consistent styling
- Add comments to explain complex parts
- Follow the Mermaid syntax guidelines
- Test rendering before committing changes

## Resources

- [Mermaid Documentation](https://mermaid.js.org/intro/)
- [Mermaid Live Editor](https://mermaid.live)
- [Mermaid Cheat Sheet](https://jojozhuang.github.io/tutorial/mermaid-cheat-sheet/) 