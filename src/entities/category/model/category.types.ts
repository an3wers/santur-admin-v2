import type { CategoryDto, ExtFieldsDto } from '../api/category.schemas'

export interface Category extends Omit<CategoryDto, 'extendFields' | 'customFields' | 'menuOrder'> {
  menuOrder?: number
}
export interface ExtFields extends ExtFieldsDto {}
