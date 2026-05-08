"use client";

import { useEffect } from "react";

type EnPlaceholderSanitizerProps = {
  replacementText: string;
};

/**
 * Temporary UI stabilization guard:
 * Replaces leaked placeholder literals like `EN EN` / `EN EN EN` in rendered text
 * with a localized neutral phrase until every screen is fully reconnected to keys.
 */
export function EnPlaceholderSanitizer({ replacementText }: EnPlaceholderSanitizerProps) {
  useEffect(() => {
    const repeatedPattern = /\bEN(?:\s+EN){1,}\b/g;
    const singleTokenPattern = /(^|[\s([{"'|:;,.!?/-])EN(?=$|[\s)\]}"'|:;,.!?/-])/g;

    const sanitize = (value: string) => {
      let next = value.replace(repeatedPattern, replacementText);
      next = next.replace(singleTokenPattern, `$1${replacementText}`);
      return next;
    };

    const normalizeTextNode = (node: Text) => {
      const value = node.nodeValue;
      if (!value) return;
      const next = sanitize(value);
      if (next === value) return;
      node.nodeValue = next;
    };

    const normalizeElementAttributes = (element: Element) => {
      if (!(element instanceof HTMLElement)) return;

      const placeholder = element.getAttribute("placeholder");
      if (placeholder) {
        const nextPlaceholder = sanitize(placeholder);
        if (nextPlaceholder !== placeholder) {
          element.setAttribute("placeholder", nextPlaceholder);
        }
      }

      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        if (typeof element.value === "string") {
          const nextValue = sanitize(element.value);
          if (nextValue !== element.value) {
            element.value = nextValue;
          }
        }
      }
    };

    const walk = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      let current: Node | null = walker.currentNode;

      while (current) {
        if (current.nodeType === Node.TEXT_NODE) {
          normalizeTextNode(current as Text);
        } else if (current.nodeType === Node.ELEMENT_NODE) {
          normalizeElementAttributes(current as Element);
        }
        current = walker.nextNode();
      }
    };

    walk(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData" && mutation.target.nodeType === Node.TEXT_NODE) {
          normalizeTextNode(mutation.target as Text);
          continue;
        }

        if (mutation.type === "attributes" && mutation.target.nodeType === Node.ELEMENT_NODE) {
          normalizeElementAttributes(mutation.target as Element);
          continue;
        }

        for (const node of mutation.addedNodes) {
          walk(node);
        }
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "value"],
    });

    return () => observer.disconnect();
  }, [replacementText]);

  return null;
}
