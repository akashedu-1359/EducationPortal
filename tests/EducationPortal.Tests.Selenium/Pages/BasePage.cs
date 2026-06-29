using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using EducationPortal.Tests.Selenium.Base;
using EducationPortal.Tests.Selenium.Config;

namespace EducationPortal.Tests.Selenium.Pages;

public abstract class BasePage
{
    protected readonly IWebDriver Driver;
    protected readonly TestSettings Settings;
    protected readonly WaitHelpers Wait;

    protected BasePage(IWebDriver driver)
    {
        Driver = driver;
        Settings = TestSettings.Instance;
        Wait = new WaitHelpers(driver, Settings);
    }

    // Common locators
    protected By NavbarLocator => By.CssSelector("nav, header");
    protected By FooterLocator => By.CssSelector("footer");
    protected By LoadingSpinner => By.CssSelector("[class*='spinner'], [class*='loading'], [role='status'], [class*='skeleton'], [class*='animate-pulse']");

    public string CurrentUrl => Driver.Url;
    public string PageTitle => Driver.Title;

    public void WaitForPageLoad()
    {
        Wait.WaitForPageLoad();
        Wait.WaitForNextJsHydration();
    }

    public bool IsNavbarVisible()
    {
        return Wait.IsElementDisplayed(NavbarLocator);
    }

    public bool IsFooterVisible()
    {
        Wait.ScrollToBottom();
        return Wait.IsElementDisplayed(FooterLocator);
    }

    public IWebElement FindElement(By locator)
    {
        return Wait.WaitForElement(locator);
    }

    public IReadOnlyList<IWebElement> FindElements(By locator)
    {
        return Driver.FindElements(locator);
    }

    public bool IsElementDisplayed(By locator)
    {
        return Wait.IsElementDisplayed(locator);
    }

    public bool IsElementPresent(By locator)
    {
        return Wait.IsElementPresent(locator);
    }

    // Navigation
    public void NavigateTo(string path)
    {
        Driver.Navigate().GoToUrl($"{Settings.BaseUrl}{path}");
        WaitForPageLoad();
    }

    public void NavigateToUrl(string path)
    {
        Driver.Navigate().GoToUrl($"{Settings.BaseUrl}{path}");
        WaitForPageLoad();
    }

    // Click
    public void ClickElement(By locator)
    {
        Click(locator);
    }

    public void Click(By locator)
    {
        var element = Wait.WaitForElementClickable(locator);
        var js = (IJavaScriptExecutor)Driver;
        js.ExecuteScript("arguments[0].scrollIntoView({behavior:'instant', block:'center'});", element);
        Thread.Sleep(300);

        try
        {
            element.Click();
        }
        catch (ElementClickInterceptedException)
        {
            js.ExecuteScript("arguments[0].click();", element);
        }
    }

    // Text input
    public void TypeText(By locator, string text)
    {
        var element = Wait.WaitForElement(locator);
        element.Clear();
        element.SendKeys(text);
    }

    public void Type(By locator, string text)
    {
        var element = Wait.WaitForElement(locator);
        element.Clear();
        element.SendKeys(text);
    }

    public void ClearAndType(By locator, string text)
    {
        var element = Wait.WaitForElement(locator);
        element.Clear();
        element.SendKeys(text);
    }

    // Get text / attributes
    public string GetText(By locator)
    {
        return Wait.WaitForElement(locator).Text;
    }

    public string GetAttribute(By locator, string attribute)
    {
        return Wait.WaitForElement(locator).GetAttribute(attribute) ?? string.Empty;
    }

    // Wait helpers
    public bool WaitForUrlContains(string urlPart)
    {
        return Wait.WaitForUrlContains(urlPart);
    }

    public bool WaitForUrlToBe(string url)
    {
        return Wait.WaitForUrlToBe(url);
    }

    public void WaitForSpinnerToDisappear()
    {
        try
        {
            Wait.WaitForElementInvisible(LoadingSpinner, TimeSpan.FromSeconds(10));
        }
        catch { }
    }

    // Select dropdown
    public void SelectByValue(By locator, string value)
    {
        var element = Wait.WaitForElement(locator);
        var select = new SelectElement(element);
        select.SelectByValue(value);
    }

    public void SelectByText(By locator, string text)
    {
        var element = Wait.WaitForElement(locator);
        var select = new SelectElement(element);
        select.SelectByText(text);
    }

    // Navbar / Footer
    public IWebElement GetNavbar()
    {
        return FindElement(NavbarLocator);
    }

    public IWebElement GetFooter()
    {
        Wait.ScrollToBottom();
        return FindElement(FooterLocator);
    }

    // Text checks
    public bool HasText(string text)
    {
        try
        {
            var body = Driver.FindElement(By.TagName("body"));
            return body.Text.Contains(text, StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }

    public IWebElement FindByText(string text, string tag = "*")
    {
        var xpath = $"//{tag}[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'{text.ToLowerInvariant()}')]";
        return Wait.WaitForElement(By.XPath(xpath));
    }

    public IWebElement FindLinkByText(string text)
    {
        return FindByText(text, "a");
    }

    public IWebElement FindButtonByText(string text)
    {
        var xpath = $"//button[contains(translate(normalize-space(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'{text.ToLowerInvariant()}')] | //a[contains(translate(normalize-space(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'{text.ToLowerInvariant()}') and (contains(@class,'btn') or contains(@class,'button') or @role='button')]";
        return Wait.WaitForElement(By.XPath(xpath));
    }
}
