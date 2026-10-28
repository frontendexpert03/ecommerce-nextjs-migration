import type { Locator } from '@playwright/test'
import { StorePage, type Category } from './store-page'

export class CategoryPage extends StorePage {
  heading(category: Category): Locator {
    return this.page.getByRole('heading', {
      level: 1,
      name: category,
      exact: true,
    })
  }

  showBox(category: Category, id: number): Locator {
    return this.byTest(`showbox-${category}-${id}`)
  }

  productButton(category: Category, id: number): Locator {
    return this.showBox(category, id).getByRole('button', {
      name: 'to product',
    })
  }

  quickAddButton(category: Category, id: number): Locator {
    return this.byTest(`quick-add-${category}-${id}`)
  }

  async quickAdd(category: Category, id: number, times = 1) {
    for (let i = 0; i < times; i++)
      await this.quickAddButton(category, id).click()
  }
}
