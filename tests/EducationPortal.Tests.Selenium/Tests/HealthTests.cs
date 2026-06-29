using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using EducationPortal.Tests.Selenium.Base;
using EducationPortal.Tests.Selenium.Helpers;
using EducationPortal.Tests.Selenium.Pages.Public;

namespace EducationPortal.Tests.Selenium.Tests;

[TestFixture]
[Category("Health")]
[Order(1)]
public class HealthTests : BaseTest
{
    [Test, Order(1)]
    [Description("Frontend loads successfully")]
    public void Frontend_Should_Load_Successfully()
    {
        NavigateTo("/");
        Wait.WaitForPageLoad();

        var body = Driver.FindElement(By.TagName("body"));
        body.Should().NotBeNull();
        body.Text.Should().NotBeNullOrEmpty();
    }

    [Test, Order(2)]
    [Description("Page title is set")]
    public void Page_Title_Should_Be_Set()
    {
        NavigateTo("/");
        Wait.WaitForPageLoad();

        Driver.Title.Should().NotBeNullOrEmpty("Page should have a title");
    }

    [Test, Order(3)]
    [Description("Backend health endpoint returns healthy")]
    public async Task Backend_Health_Endpoint_Should_Return_Healthy()
    {
        using var api = new ApiHelper(Settings);
        var healthy = await api.CheckBackendHealthAsync();
        healthy.Should().BeTrue("Backend should respond to health check");
    }

    [Test, Order(4)]
    [Description("Navbar is visible on the page")]
    public void Navbar_Should_Be_Visible()
    {
        NavigateTo("/");
        Wait.WaitForPageLoad();

        var navbar = Driver.FindElements(By.CssSelector("nav, header"));
        navbar.Should().NotBeEmpty("Page should have a navbar or header");
        navbar.First().Displayed.Should().BeTrue();
    }

    [Test, Order(5)]
    [Description("Footer is visible on the page")]
    public void Footer_Should_Be_Visible()
    {
        NavigateTo("/");
        Wait.WaitForPageLoad();

        ((IJavaScriptExecutor)Driver).ExecuteScript("window.scrollTo(0, document.body.scrollHeight);");
        Thread.Sleep(500);

        var footer = Driver.FindElements(By.CssSelector("footer"));
        footer.Should().NotBeEmpty("Page should have a footer");
        footer.First().Displayed.Should().BeTrue();
    }

    [Test, Order(6)]
    [Description("No severe JavaScript errors in browser console")]
    public void Should_Have_No_Severe_JavaScript_Errors()
    {
        NavigateTo("/");
        Wait.WaitForPageLoad();

        var logs = GetBrowserLogs();
        var severeErrors = logs
            .Where(l => l.Level == LogLevel.Severe)
            .Where(l => !l.Message.Contains("favicon", StringComparison.OrdinalIgnoreCase))
            .Where(l => !l.Message.Contains("third-party", StringComparison.OrdinalIgnoreCase))
            .ToList();

        severeErrors.Should().BeEmpty(
            $"No severe JS errors expected. Found: {string.Join(", ", severeErrors.Select(e => e.Message))}");
    }
}
