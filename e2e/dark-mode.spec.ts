import { test, expect, type Page } from '@playwright/test'

/** Navigate from app start to the menu view (skip BindTable / WelcomeView). */
async function goToMenu(page: Page) {
  await page.goto('/')
  // Bind table
  await page.getByRole('button', { name: /A08/ }).first().click()
  // Welcome page - enter menu
  await page.getByRole('button', { name: /进入点餐|Enter/ }).click()
}

test.describe('夜间模式（Dark Mode）- E2E 验收测试', () => {

  test('DM-001: 首次访问默认使用日间模式，html 上无 dark class', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  })

  test('DM-002: 点击夜间模式切换按钮后 html 获得 dark class，界面变为深色', async ({ page }) => {
    await goToMenu(page)
    const toggle = page.getByRole('button', { name: /切换至夜间模式|Switch to Dark Mode/ })
    await toggle.click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  })

  test('DM-003: 切换至夜间模式后顶栏浮层提示"已切换为夜间模式"', async ({ page }) => {
    await goToMenu(page)
    const toggle = page.getByRole('button', { name: /切换至夜间模式|Switch to Dark Mode/ })
    await toggle.click()
    await expect(page.getByText('已切换为夜间模式')).toBeVisible()
  })

  test('DM-004: 夜间模式下图标变为 Sun（aria-label 变为切换至日间模式）', async ({ page }) => {
    await goToMenu(page)
    const toggle = page.getByRole('button', { name: /切换至夜间模式|Switch to Dark Mode/ })
    await toggle.click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    await expect(page.getByRole('button', { name: /切换至日间模式|Switch to Light Mode/ })).toBeVisible()
  })

  test('DM-005: 再次点击切换按钮恢复日间模式，html 移除 dark class', async ({ page }) => {
    await goToMenu(page)
    const toggleOn = page.getByRole('button', { name: /切换至夜间模式|Switch to Dark Mode/ })
    await toggleOn.click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    const toggleOff = page.getByRole('button', { name: /切换至日间模式|Switch to Light Mode/ })
    await toggleOff.click()
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  })

  test('DM-006: 切换回日间模式后浮层提示"已切换为日间模式"', async ({ page }) => {
    await goToMenu(page)
    const toggleOn = page.getByRole('button', { name: /切换至夜间模式|Switch to Dark Mode/ })
    await toggleOn.click()
    const toggleOff = page.getByRole('button', { name: /切换至日间模式|Switch to Light Mode/ })
    await toggleOff.click()
    await expect(page.getByText('已切换为日间模式')).toBeVisible()
  })

  test('DM-007: 夜间模式偏好持久化到 localStorage，刷新后保持', async ({ page }) => {
    await goToMenu(page)
    const toggle = page.getByRole('button', { name: /切换至夜间模式|Switch to Dark Mode/ })
    await toggle.click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    // Verify localStorage key
    const stored = await page.evaluate(() => localStorage.getItem('dark-mode'))
    expect(stored).toBe('true')
    // Reload page
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  })

  test('DM-008: 日间模式偏好持久化，刷新后保持日间模式', async ({ page }) => {
    await goToMenu(page)
    // Enable dark, then disable
    const toggleOn = page.getByRole('button', { name: /切换至夜间模式|Switch to Dark Mode/ })
    await toggleOn.click()
    const toggleOff = page.getByRole('button', { name: /切换至日间模式|Switch to Light Mode/ })
    await toggleOff.click()
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
    const stored = await page.evaluate(() => localStorage.getItem('dark-mode'))
    expect(stored).toBe('false')
    await page.reload()
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  })

  test('DM-009: 夜间模式与老人模式可同时启用，html 同时拥有 dark 和 elderly class', async ({ page }) => {
    await goToMenu(page)
    // Enable dark mode
    const darkToggle = page.getByRole('button', { name: /切换至夜间模式|Switch to Dark Mode/ })
    await darkToggle.click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    // Enable elderly mode
    const elderlyToggle = page.getByRole('button', { name: /切换至老人模式/ })
    await elderlyToggle.click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    await expect(page.locator('html')).toHaveClass(/\belderly\b/)
  })

  test('DM-010: 切换语言不影响当前夜间模式状态', async ({ page }) => {
    await goToMenu(page)
    // Enable dark mode
    const darkToggle = page.getByRole('button', { name: /切换至夜间模式|Switch to Dark Mode/ })
    await darkToggle.click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    // Switch language
    const langToggle = page.getByRole('button', { name: /切换语言|Switch language/ })
    await langToggle.click()
    // Dark mode should still be active
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    // aria-label should now be in English
    await expect(page.getByRole('button', { name: 'Switch to Light Mode' })).toBeVisible()
  })

  test('DM-011: 夜间模式下切换为英文时浮层提示为英文', async ({ page }) => {
    await goToMenu(page)
    // Switch to English first
    const langToggle = page.getByRole('button', { name: /切换语言|Switch language/ })
    await langToggle.click()
    // Now switch to dark mode
    const darkToggle = page.getByRole('button', { name: /Switch to Dark Mode/ })
    await darkToggle.click()
    await expect(page.getByText('Switched to Dark Mode')).toBeVisible()
  })

  test('DM-012: 夜间模式覆盖菜单页面背景色变化', async ({ page }) => {
    await goToMenu(page)
    // Get background color before dark mode
    const bgBefore = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).backgroundColor
    })
    // Enable dark mode
    const darkToggle = page.getByRole('button', { name: /切换至夜间模式|Switch to Dark Mode/ })
    await darkToggle.click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    // Get background color after dark mode
    const bgAfter = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).backgroundColor
    })
    expect(bgAfter).not.toBe(bgBefore)
  })

  test('DM-013: 夜间模式覆盖订单页面', async ({ page }) => {
    await goToMenu(page)
    // Enable dark mode
    const darkToggle = page.getByRole('button', { name: /切换至夜间模式|Switch to Dark Mode/ })
    await darkToggle.click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    // Navigate to order view
    await page.getByRole('button', { name: /订单|Order/ }).first().click()
    // Dark mode should persist
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  })

  test('DM-014: 夜间模式下夜间模式按钮存在且可点击', async ({ page }) => {
    await goToMenu(page)
    // In light mode, the Moon button should be visible
    const moonBtn = page.getByRole('button', { name: /切换至夜间模式|Switch to Dark Mode/ })
    await expect(moonBtn).toBeVisible()
    await moonBtn.click()
    // In dark mode, the Sun button should be visible
    const sunBtn = page.getByRole('button', { name: /切换至日间模式|Switch to Light Mode/ })
    await expect(sunBtn).toBeVisible()
  })

  test('DM-015: 夜间模式下菜品图片原样显示，无滤镜', async ({ page }) => {
    await goToMenu(page)
    // Enable dark mode
    const darkToggle = page.getByRole('button', { name: /切换至夜间模式|Switch to Dark Mode/ })
    await darkToggle.click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    // Check that images do not have filter applied via CSS
    const imgFilter = await page.evaluate(() => {
      const img = document.querySelector('article img') as HTMLImageElement | null
      if (!img) return null
      const style = window.getComputedStyle(img)
      return {
        filter: style.filter,
        opacity: style.opacity,
      }
    })
    expect(imgFilter).not.toBeNull()
    // Filter should be 'none' (no darkening filter on images)
    expect(imgFilter!.filter).toBe('none')
  })

  test('DM-016: 清除 localStorage 后刷新，默认恢复日间模式', async ({ page }) => {
    await goToMenu(page)
    const darkToggle = page.getByRole('button', { name: /切换至夜间模式|Switch to Dark Mode/ })
    await darkToggle.click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    // Clear localStorage
    await page.evaluate(() => localStorage.removeItem('dark-mode'))
    await page.reload()
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  })
})
