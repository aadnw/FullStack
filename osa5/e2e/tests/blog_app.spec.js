const { test, expect, beforeEach, describe } = require('@playwright/test')
test.setTimeout(30000);

describe('Blog app', () => {
    beforeEach(async ({ page, request }) => {
        await request.post('http://localhost:3003/api/testing/reset')
        await request.post('http://localhost:3003/api/users', {
            data: {
                name: 'Maija Meikäläinen',
                username: 'majakka',
                password: 'salainen'
            }
        })
        await request.post('http://localhost:3003/api/users', {
            data: {
                name: 'Liisa Ihmemaa',
                username: 'ihmeli',
                password: 'salainen'
            }
        })
        
        await page.goto('http://localhost:5173')
    })

    test('Login form is shown', async ({ page }) => {
        await expect(page.getByText('blogs')).toBeVisible()
        await expect(page.getByText('Log in')).toBeVisible()
        await expect(page.getByText('username')).toBeVisible()
        await expect(page.getByText('password')).toBeVisible()
        await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
    })

    describe('Login', () => {
        test('succeeds with correct credentials', async ({ page }) => {
            await page.getByLabel('username').fill('majakka')
            await page.getByLabel('password').fill('salainen')

            await page.getByRole('button', { name: 'login' }).click()

            await expect(page.getByText('Maija Meikäläinen logged in')).toBeVisible()
        })

        test('fails with wrong credentials', async ({ page }) => {
            await page.getByLabel('username').fill('majakka')
            await page.getByLabel('password').fill('wrong')

            await page.getByRole('button', { name: 'login' }).click()

            await expect(page.getByText('wrong username or password')).toBeVisible()
            await expect(page.getByText('Maija Meikäläinen logged in')).not.toBeVisible()
        })
    })

    describe('When logged in', () => {
        beforeEach(async ({ page }) => {
            await page.getByLabel('username').fill('majakka')
            await page.getByLabel('password').fill('salainen')
            await page.getByRole('button', { name: 'login' }).click()
            await expect(page.getByText('Maija Meikäläinen logged in')).toBeVisible()
        })

        test('a new blog can be created', async ({ page }) => {
            await page.getByRole('button', { name: 'create new blog' }).click()
            await page.getByLabel('title:').fill('Instructions For Test Blog')
            await page.getByLabel('author:').fill('Playwright')
            await page.getByLabel('url:').fill('www.playwright.com')
            await page.getByRole('button', { name: 'create' }).click()

            await expect(page.getByText(`Instructions For Test Blog Playwright`)).toBeVisible()
            
            await expect(page.getByLabel('title:')).not.toBeVisible()
        })
        
        test('a blog can be liked', async ({ page }) => {
            await page.getByRole('button', { name: 'create new blog' }).click()
            await page.getByLabel('title:').fill('Instructions For Test Blog')
            await page.getByLabel('author:').fill('Playwright')
            await page.getByLabel('url:').fill('www.playwright.com')
            await page.getByRole('button', { name: 'create' }).click()

            await expect(page.getByText(`Instructions For Test Blog Playwright`)).toBeVisible()

            await expect(page.getByRole('button', { name: 'view' })).toBeVisible()
            await page.getByRole('button', { name: 'view' }).click()

            await expect(page.getByText('likes 0')).toBeVisible()
            await page.getByRole('button', { name: 'like' }).click()
            await expect(page.getByText('likes 1')).toBeVisible()
        })

        test('a blog can be deleted only by the creator', async ({ page }) => {
            await page.getByRole('button', { name: 'create new blog' }).click()
            await page.getByLabel('title:').fill('Instructions For Test Blog')
            await page.getByLabel('author:').fill('Playwright')
            await page.getByLabel('url:').fill('www.playwright.com')
            await page.getByRole('button', { name: 'create' }).click()

            await expect(page.getByText(`Instructions For Test Blog Playwright`)).toBeVisible()

            await expect(page.getByRole('button', { name: 'view' })).toBeVisible()
            await page.getByRole('button', { name: 'view' }).click()

            await expect(page.getByRole('button', { name: 'remove' })).toBeVisible()

            page.on('dialog', dialog => {
                const msg = dialog.message();
                expect(msg).toContain("Remove blog Instructions For Test Blog by Playwright?");
                dialog.accept();
            })

            await page.getByRole('button', { name: 'remove' }).click()

            await expect(page.getByText(`Instructions For Test Blog Playwright`)).not.toBeVisible()
        })

        test('only blog creator can see delete button', async ({ page }) => {
            await page.getByRole('button', { name: 'create new blog' }).click()
            await page.getByLabel('title:').fill('Instructions For Test Blog')
            await page.getByLabel('author:').fill('Playwright')
            await page.getByLabel('url:').fill('www.playwright.com')
            await page.getByRole('button', { name: 'create' }).click()

            await expect(page.getByText(`Instructions For Test Blog Playwright`)).toBeVisible()

            await expect(page.getByRole('button', { name: 'view' })).toBeVisible()
            await page.getByRole('button', { name: 'view' }).click()

            await expect(page.getByRole('button', { name: 'remove' })).toBeVisible()




            await page.getByRole('button', { name: 'logout' }).click()
            await expect(page.getByRole('button', { name: 'login' })).toBeVisible()

            await page.getByLabel('username').fill('ihmeli')
            await page.getByLabel('password').fill('salainen')

            await page.getByRole('button', { name: 'login' }).click()

            await expect(page.getByText('Liisa Ihmemaa logged in')).toBeVisible()

            await expect(page.getByText(`Instructions For Test Blog Playwright`)).toBeVisible()

            await expect(page.getByRole('button', { name: 'view' })).toBeVisible()
            await page.getByRole('button', { name: 'view' }).click()

            await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
        })

        test('blogs are ordered by likes', async ({ page }) => {
            const titles = ['Test Blog One', 'Test Blog Two', 'Test Blog Three']

            await page.getByRole('button', { name: 'create new blog' }).click()
            await page.getByLabel('title:').fill(titles[0])
            await page.getByLabel('author:').fill('Tester')
            await page.getByLabel('url:').fill('www.test.com')
            await page.getByRole('button', { name: 'create' }).click()
            await expect(page.getByText('Test Blog One Tester')).toBeVisible()

            await page.getByRole('button', { name: 'create new blog' }).click()
            await page.getByLabel('title:').fill(titles[1])
            await page.getByLabel('author:').fill('Tester')
            await page.getByLabel('url:').fill('www.test.com')
            await page.getByRole('button', { name: 'create' }).click()
            await expect(page.getByText('Test Blog Two Tester')).toBeVisible()

            await page.getByRole('button', { name: 'create new blog' }).click()
            await page.getByLabel('title:').fill(titles[2])
            await page.getByLabel('author:').fill('Tester')
            await page.getByLabel('url:').fill('www.test.com')
            await page.getByRole('button', { name: 'create' }).click()
            await expect(page.getByText('Test Blog Three Tester')).toBeVisible()

            for (let i = 0; i < 3; i++) {
                const title = titles[i]
                const blogContainer = page.getByText(title).locator('xpath=..')

                await expect(blogContainer).toBeVisible()

                const viewButton = blogContainer.getByRole('button', { name: 'view' })
                await expect(viewButton).toBeVisible()
                await viewButton.click()

                const likeAmount = i + 1
                const likeButton = blogContainer.getByRole('button', { name: 'like' })
                await expect(likeButton).toBeVisible()

                for (let j = 0; j < likeAmount; j++) {
                    await likeButton.click()
                }
            }

            for (let i = 0; i < 3; i++) {
                const title = titles[2 - i]
                const blogContainer = page.getByText(title).locator('xpath=..')

                await expect(blogContainer).toBeVisible()

                await expect(blogContainer.getByText(`likes ${i + (3-i-i)}`)).toBeVisible()

                await expect(title).toBe(titles[2 - i])
            }
        })
    })
})