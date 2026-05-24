/**
 * Forever Core - Markdown Processing
 * Markdown 处理与转换模块
 */

export interface MarkdownNode {
  type: 'text' | 'bold' | 'italic' | 'code' | 'link' | 'heading' | 'paragraph' | 'list' | 'listItem';
  content?: string;
  children?: MarkdownNode[];
  level?: number;
  url?: string;
  language?: string;
}

export class MarkdownParser {
  parse(markdown: string): MarkdownNode[] {
    const nodes: MarkdownNode[] = [];
    const lines = markdown.split('\n');
    let currentParagraph: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('#')) {
        if (currentParagraph.length > 0) {
          nodes.push(this.createParagraph(currentParagraph.join('\n')));
          currentParagraph = [];
        }
        nodes.push(this.parseHeading(line));
      } else if (line.trim() === '') {
        if (currentParagraph.length > 0) {
          nodes.push(this.createParagraph(currentParagraph.join('\n')));
          currentParagraph = [];
        }
      } else {
        currentParagraph.push(line);
      }
    }

    if (currentParagraph.length > 0) {
      nodes.push(this.createParagraph(currentParagraph.join('\n')));
    }

    return nodes;
  }

  private parseHeading(line: string): MarkdownNode {
    const match = line.match(/^(#{1,6})\s+(.*)$/);
    if (match) {
      return {
        type: 'heading',
        level: match[1].length,
        children: this.parseInline(match[2]),
      };
    }
    return { type: 'paragraph', children: this.parseInline(line) };
  }

  private createParagraph(text: string): MarkdownNode {
    return {
      type: 'paragraph',
      children: this.parseInline(text),
    };
  }

  private parseInline(text: string): MarkdownNode[] {
    const nodes: MarkdownNode[] = [];
    let lastIndex = 0;
    let i = 0;

    while (i < text.length) {
      if (text.substring(i, i + 2) === '**') {
        if (i > lastIndex) {
          nodes.push({ type: 'text', content: text.substring(lastIndex, i) });
        }
        const end = text.indexOf('**', i + 2);
        if (end !== -1) {
          nodes.push({
            type: 'bold',
            children: [{ type: 'text', content: text.substring(i + 2, end) }],
          });
          i = end + 2;
          lastIndex = i;
        } else {
          i++;
        }
      } else if (text.substring(i, i + 1) === '*') {
        if (i > lastIndex) {
          nodes.push({ type: 'text', content: text.substring(lastIndex, i) });
        }
        const end = text.indexOf('*', i + 1);
        if (end !== -1) {
          nodes.push({
            type: 'italic',
            children: [{ type: 'text', content: text.substring(i + 1, end) }],
          });
          i = end + 1;
          lastIndex = i;
        } else {
          i++;
        }
      } else if (text.substring(i, i + 1) === '`') {
        if (i > lastIndex) {
          nodes.push({ type: 'text', content: text.substring(lastIndex, i) });
        }
        const end = text.indexOf('`', i + 1);
        if (end !== -1) {
          nodes.push({
            type: 'code',
            content: text.substring(i + 1, end),
          });
          i = end + 1;
          lastIndex = i;
        } else {
          i++;
        }
      } else {
        i++;
      }
    }

    if (lastIndex < text.length) {
      nodes.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return nodes;
  }
}

export class MarkdownRenderer {
  renderToPlainText(nodes: MarkdownNode[]): string {
    return nodes.map(node => this.renderNodeToPlainText(node)).join('\n\n');
  }

  private renderNodeToPlainText(node: MarkdownNode): string {
    switch (node.type) {
      case 'text':
        return node.content || '';
      case 'bold':
      case 'italic':
      case 'heading':
      case 'paragraph':
        return node.children?.map(n => this.renderNodeToPlainText(n)).join('') || '';
      case 'code':
        return node.content || '';
      case 'list':
      case 'listItem':
        return node.children?.map(n => this.renderNodeToPlainText(n)).join('\n') || '';
      default:
        return '';
    }
  }

  renderToWhatsApp(nodes: MarkdownNode[]): string {
    return nodes.map(node => this.renderNodeToWhatsApp(node)).join('\n\n');
  }

  private renderNodeToWhatsApp(node: MarkdownNode): string {
    switch (node.type) {
      case 'text':
        return node.content || '';
      case 'bold':
        return `*${node.children?.map(n => this.renderNodeToWhatsApp(n)).join('') || ''}*`;
      case 'italic':
        return `_${node.children?.map(n => this.renderNodeToWhatsApp(n)).join('') || ''}_`;
      case 'code':
        return `\`${node.content || ''}\``;
      case 'heading':
        const prefix = '#'.repeat(node.level || 1) + ' ';
        return prefix + (node.children?.map(n => this.renderNodeToWhatsApp(n)).join('') || '');
      case 'paragraph':
        return node.children?.map(n => this.renderNodeToWhatsApp(n)).join('') || '';
      default:
        return '';
    }
  }

  renderToHTML(nodes: MarkdownNode[]): string {
    return nodes.map(node => this.renderNodeToHTML(node)).join('\n');
  }

  private renderNodeToHTML(node: MarkdownNode): string {
    switch (node.type) {
      case 'text':
        return this.escapeHTML(node.content || '');
      case 'bold':
        return `<strong>${node.children?.map(n => this.renderNodeToHTML(n)).join('') || ''}</strong>`;
      case 'italic':
        return `<em>${node.children?.map(n => this.renderNodeToHTML(n)).join('') || ''}</em>`;
      case 'code':
        return `<code>${this.escapeHTML(node.content || '')}</code>`;
      case 'heading':
        const tag = `h${node.level || 1}`;
        return `<${tag}>${node.children?.map(n => this.renderNodeToHTML(n)).join('') || ''}</${tag}>`;
      case 'paragraph':
        return `<p>${node.children?.map(n => this.renderNodeToHTML(n)).join('') || ''}</p>`;
      default:
        return '';
    }
  }

  private escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export const markdownParser = new MarkdownParser();
export const markdownRenderer = new MarkdownRenderer();
