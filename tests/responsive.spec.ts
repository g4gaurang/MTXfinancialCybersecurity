import { expect, test } from '@playwright/test'

const viewports = [
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]

for (const viewport of viewports) {
  test(`${viewport.name} layout and interactions`, async ({ page }) => {
    test.setTimeout(60_000)
    await page.setViewportSize(viewport)
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    await page.goto('')
    await expect(page.getByRole('heading', { name: 'Turn financial signals into explainable compliance leads.' })).toBeVisible()

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)

    const menu = page.getByRole('button', { name: 'Menu' })
    await menu.click()
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Challenges' })).toBeVisible()
    await page.getByRole('navigation').getByRole('link', { name: 'Challenges' }).click()
    await expect(menu).toHaveAttribute('aria-expanded', 'false')

    await page.getByRole('tab', { name: /Disconnected evidence/ }).click()
    await expect(page.getByRole('tabpanel').filter({ hasText: 'Disconnected evidence' })).toBeVisible()

    await page.getByRole('tab', { name: /Receive a Lead/ }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: /Attach Approved Signals/ })).toHaveAttribute('aria-selected', 'true')

    await page.locator('#planned').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'Address A' }).click()
    await expect(page.locator('.network-detail')).toContainText('Source: approved filing field')
    await page.getByText('Accessible relationship list').click()
    await expect(page.getByText(/Person A:/)).toBeVisible()

    await page.locator('#analytics').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'Signal category' }).click()
    await expect(page.getByRole('heading', { name: 'Cases by signal category' })).toBeVisible()

    await page.locator('#configuration').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'Municipal profile' }).click()
    await expect(page.getByText('Central revenue review queue')).toBeVisible()

    await page.locator('#roadmap').scrollIntoViewIfNeeded()
    await page.getByRole('tab', { name: /Extend Carefully/ }).click()
    await expect(page.getByText('Add approved data sources')).toBeVisible()

    await menu.click()
    const navDemoButton = page.getByRole('navigation').getByRole('button', { name: 'Request a Demo' })
    await navDemoButton.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByLabel('Name *')).toBeFocused()
    const controls = page.getByRole('dialog').locator('button, input, select, textarea')
    const last = controls.last()
    await last.focus()
    await page.keyboard.press('Tab')
    await expect(controls.first()).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(navDemoButton).toBeFocused()

    const smallTargets = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('button, a, input, select, textarea')]
        .filter((element) => {
          const style = getComputedStyle(element)
          const rect = element.getBoundingClientRect()
          return style.display !== 'none' && rect.width > 0 && rect.height > 0 && (rect.width < 40 || rect.height < 40)
        })
        .map((element) => `${element.tagName}:${element.textContent?.trim().slice(0, 30)}:${Math.round(element.getBoundingClientRect().width)}x${Math.round(element.getBoundingClientRect().height)}`),
    )
    expect(smallTargets.filter((target) => !target.startsWith('INPUT:'))).toEqual([])
    expect(consoleErrors).toEqual([])
  })
}
