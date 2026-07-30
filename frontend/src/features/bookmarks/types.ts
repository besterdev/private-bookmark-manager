export interface Bookmark {
  id: string
  url: string
  title: string
  notes: string | null
  collectionId: string | null
  createdAt: string
  updatedAt: string
}
export interface CollectionOption {
  id: string
  name: string
}
