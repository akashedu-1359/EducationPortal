using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using EducationPortal.Tests.Selenium.Config;

namespace EducationPortal.Tests.Selenium.Base;

public class WaitHelpers
{
    private readonly IWebDriver _driver;
    private readonly TestSettings _settings;

    public WaitHelpers(IWebDriver driver, TestSettings settings)
    {
        _driver = driver;
        _settings = settings;
    }

    private WebDriverWait CreateWait(TimeSpan? timeout = null)
    {
        var wait = new WebDriverWait(_driver, timeout ?? _settings.Timeout);
        wait.PollingInterval = _settings.PollingInterval;
        wait.IgnoreExceptionTypes(
            typeof(NoSuchElementException),
            typeof(StaleElementReferenceException),
            typeof(ElementNotInteractableException)
        );
        return wait;
    }

    public IWebElement WaitForElement(By locator, TimeSpan? timeout = null)
    {
        return CreateWait(timeout).Until(d =>
        {
            var element = d.FindElement(locator);
            return element.Displayed ? element : null;
        }) ?? throw new WebDriverTimeoutException($"Element not found: {locator}");
    }

    public IWebElement WaitForElementClickable(By locator, TimeSpan? timeout = null)
    {
        return CreateWait(timeout).Until(d =>
        {
            var element = d.FindElement(locator);
            return element.Displayed && element.Enabled ? element : null;
        }) ?? throw new WebDriverTimeoutException($"Element not clickable: {locator}");
    }

    public IReadOnlyList<IWebElement> WaitForElements(By locator, TimeSpan? timeout = null)
    {
        CreateWait(timeout).Until(d =>
        {
            var elements = d.FindElements(locator);
            return elements.Count > 0 ? elements : null;
        });
        return _driver.FindElements(locator);
    }

    public bool WaitForElementInvisible(By locator, TimeSpan? timeout = null)
    {
        try
        {
            return CreateWait(timeout).Until(d =>
            {
                try
                {
                    var element = d.FindElement(locator);
                    return !element.Displayed;
                }
                catch (NoSuchElementException)
                {
                    return true;
                }
            });
        }
        catch (WebDriverTimeoutException)
        {
            return false;
        }
    }

    public bool WaitForUrlContains(string urlPart, TimeSpan? timeout = null)
    {
        try
        {
            return CreateWait(timeout).Until(d => d.Url.Contains(urlPart, StringComparison.OrdinalIgnoreCase));
        }
        catch (WebDriverTimeoutException)
        {
            return false;
        }
    }

    public bool WaitForUrlToBe(string url, TimeSpan? timeout = null)
    {
        try
        {
            return CreateWait(timeout).Until(d =>
                d.Url.TrimEnd('/').Equals(url.TrimEnd('/'), StringComparison.OrdinalIgnoreCase));
        }
        catch (WebDriverTimeoutException)
        {
            return false;
        }
    }

    public void WaitForPageLoad(TimeSpan? timeout = null)
    {
        CreateWait(timeout).Until(d =>
            ((IJavaScriptExecutor)d).ExecuteScript("return document.readyState")?.ToString() == "complete");
    }

    public void WaitForNextJsHydration(TimeSpan? timeout = null)
    {
        WaitForPageLoad(timeout);
        try
        {
            CreateWait(timeout ?? TimeSpan.FromSeconds(10)).Until(d =>
            {
                var result = ((IJavaScriptExecutor)d).ExecuteScript(
                    "return document.querySelector('#__next') !== null || document.querySelector('[data-nextjs-page]') !== null || document.readyState === 'complete'");
                return result is true;
            });
        }
        catch (WebDriverTimeoutException)
        {
            // Page may not use __next container
        }
    }

    public IWebElement WaitForTextPresent(By locator, string text, TimeSpan? timeout = null)
    {
        return CreateWait(timeout).Until(d =>
        {
            var element = d.FindElement(locator);
            return element.Text.Contains(text, StringComparison.OrdinalIgnoreCase) ? element : null;
        }) ?? throw new WebDriverTimeoutException($"Text '{text}' not found in element: {locator}");
    }

    public void WaitForAjaxComplete(TimeSpan? timeout = null)
    {
        CreateWait(timeout).Until(d =>
        {
            var jsExecutor = (IJavaScriptExecutor)d;
            var result = jsExecutor.ExecuteScript(
                "return typeof jQuery === 'undefined' || jQuery.active === 0");
            return result is true;
        });
    }

    public bool IsElementPresent(By locator)
    {
        try
        {
            _driver.FindElement(locator);
            return true;
        }
        catch (NoSuchElementException)
        {
            return false;
        }
    }

    public bool IsElementDisplayed(By locator)
    {
        try
        {
            return _driver.FindElement(locator).Displayed;
        }
        catch
        {
            return false;
        }
    }

    public void ScrollToElement(IWebElement element)
    {
        ((IJavaScriptExecutor)_driver).ExecuteScript(
            "arguments[0].scrollIntoView({behavior:'smooth', block:'center'});", element);
        Thread.Sleep(300);
    }

    public void ScrollToTop()
    {
        ((IJavaScriptExecutor)_driver).ExecuteScript("window.scrollTo(0, 0);");
        Thread.Sleep(200);
    }

    public void ScrollToBottom()
    {
        ((IJavaScriptExecutor)_driver).ExecuteScript("window.scrollTo(0, document.body.scrollHeight);");
        Thread.Sleep(200);
    }
}
