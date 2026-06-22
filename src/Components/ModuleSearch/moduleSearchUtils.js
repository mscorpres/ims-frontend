const normalizeSearchToken = (value = "") =>
  String(value).toLowerCase().trim().replace(/\s+/g, " ");

export const buildIndexedModuleOptions = (
  items,
  parentIndex = [],
  ancestors = [],
) => {
  if (!Array.isArray(items)) return [];

  const visibleItems = items.filter((item) => item?.isShown !== false);
  const result = [];

  visibleItems.forEach((item, idx) => {
    const currentIndex = [...parentIndex, idx + 1];
    const currentIndexText = currentIndex.join("");
    const currentLabel = item?.label ? String(item.label) : "";
    const currentAncestors = currentLabel
      ? [...ancestors, currentLabel]
      : ancestors;

    if (item?.path) {
      const breadcrumb = currentAncestors.join(" > ");
      result.push({
        key: currentIndexText,
        value: item.path,
        label: currentLabel,
        breadcrumb,
        searchIndex: currentIndexText,
        searchLabel: normalizeSearchToken(currentLabel),
        searchBreadcrumb: normalizeSearchToken(breadcrumb),
      });
    }

    if (Array.isArray(item?.children) && item.children.length > 0) {
      result.push(
        ...buildIndexedModuleOptions(
          item.children,
          currentIndex,
          currentAncestors,
        ),
      );
    }
  });

  return result;
};

export const filterModuleOptions = (options, queryRaw) => {
  const query = normalizeSearchToken(queryRaw);
  if (!query) return [];

  const digitsOnlyQuery = query.replace(/\D/g, "");

  return options
    .filter((option) => {
      const byLabel = option.searchLabel.includes(query);
      const byBreadcrumb = option.searchBreadcrumb.includes(query);
      const byPath = option.value?.toLowerCase().includes(query);
      const byIndex =
        digitsOnlyQuery.length > 0 &&
        option.searchIndex.includes(digitsOnlyQuery);
      return byLabel || byBreadcrumb || byPath || byIndex;
    })
    .slice(0, 10);
};
