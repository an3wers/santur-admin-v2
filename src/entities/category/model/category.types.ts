import type { CategoryDto, ExtFieldsDto } from '../api/category.schemas'

export interface Category extends Omit<CategoryDto, 'extendFields' | 'customFields'> {}
export interface ExtFields extends ExtFieldsDto {}
