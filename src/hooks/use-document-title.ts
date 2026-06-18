import { useEffect } from "react";
import { siteConfig } from "@/config/site";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    const defaultTitle = siteConfig.name;
    document.title = title ? `${title} | ${siteConfig.shortName}` : defaultTitle;
  }, [title]);
}
