export async function processContent(page: any, content: string, baseUrl: string): Promise<string> {
  return await page.evaluate(({ html, baseUrl }) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements = doc.querySelectorAll('*');
    const attributesToUpdate = ['href', 'src', 'srcset'];

    elements.forEach(element => {
      attributesToUpdate.forEach(attr => {
        if (element.hasAttribute(attr)) {
          const value = element.getAttribute(attr);
          if (value) {
            if (attr === 'srcset') {
              const srcsetParts = value.split(',').map(part => {
                const [url, descriptor] = part.trim().split(/\s+/);
                const absoluteUrl = new URL(url, baseUrl).href;
                return descriptor ? `${absoluteUrl} ${descriptor}` : absoluteUrl;
              });
              element.setAttribute(attr, srcsetParts.join(', '));
            } else {
              element.setAttribute(attr, new URL(value, baseUrl).href);
            }
          }
        }
      });
    });

    return doc.documentElement.outerHTML;
  }, { html: content, baseUrl });
}

