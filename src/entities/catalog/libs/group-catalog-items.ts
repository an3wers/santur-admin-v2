export const groupCatalogItems = <T extends { parent_id: number; id: number }>(items: T[]) => {
  const firstLevel = items
    .filter((item) => item.parent_id === 0)
    .map((item) => ({ ...item, child: [] as T[] }))

  const secondLevel = items.filter((item) => item.parent_id !== 0)

  secondLevel.forEach((item) => {
    const foundParent = firstLevel.find((p) => p.id === item.parent_id)

    if (foundParent) {
      foundParent.child.push(item)
    }
  })

  return firstLevel
}
