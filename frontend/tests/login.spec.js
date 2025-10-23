import { test, expect } from '@playwright/test';

// Teste de login básico usando credenciais admin
// Pressupõe que o dev server roda em http://localhost:3000
// e que o backend remoto está configurado via VITE_BACKEND_SERVER.

test.describe('Autenticação - Login', () => {
  test('deve logar com admin@admin.com/admin123', async ({ page }) => {
    // Capturar logs de console para diagnóstico
    const consoleLogs = [];
    page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));

    // Navegar para a página de login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // A página de login possui valores iniciais (admin@admin.com/admin123)
    // Vamos apenas acionar o submit do formulário.
    const loginButton = page.locator('.login-form-button');
    await expect(loginButton).toBeVisible({ timeout: 10000 });

    // Aguardar resposta da API de login para registrar status e corpo
    const loginResponsePromise = page.waitForResponse((resp) => {
      return resp.url().includes('/api/login') && resp.request().method() === 'POST';
    }, { timeout: 15000 });

    await loginButton.click();

    // Obter resposta da API
    let loginStatus = null;
    let loginBody = null;
    try {
      const loginResponse = await loginResponsePromise;
      loginStatus = loginResponse.status();
      try {
        loginBody = await loginResponse.json();
      } catch {
        loginBody = await loginResponse.text();
      }
    } catch (e) {
      loginStatus = 'NoResponse';
      loginBody = String(e);
    }

    // Capturar possível navegação pós-login
    await page.waitForLoadState('networkidle');

    // Screenshot do resultado
    await page.screenshot({ path: 'tests/screenshots/login-result.png' });

    // Critérios de sucesso: URL mudou de /login para outra rota (ex: /)
    const currentUrl = page.url();

    // Logar no console para inspeção posterior
    console.log('Login status:', loginStatus);
    console.log('Login body:', loginBody);
    console.log('Console logs:', consoleLogs);
    console.log('Current URL:', currentUrl);

    // Asserções:
    // - Se status 200, esperamos sair de /login
    // - Caso contrário, registramos erro para inspeção
    if (loginStatus === 200) {
      expect(currentUrl).not.toContain('/login');
    } else {
      // Falha intencional com detalhes
      expect.soft(loginStatus).toBe(200);
    }
  });
});