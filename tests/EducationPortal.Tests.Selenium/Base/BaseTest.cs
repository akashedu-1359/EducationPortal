using NUnit.Framework;
using NUnit.Framework.Interfaces;
using OpenQA.Selenium;
using EducationPortal.Tests.Selenium.Config;

namespace EducationPortal.Tests.Selenium.Base;

[TestFixture]
public abstract class BaseTest
{
    protected IWebDriver Driver { get; private set; } = null!;
    protected TestSettings Settings { get; private set; } = null!;
    protected WaitHelpers Wait { get; private set; } = null!;

    [SetUp]
    public virtual void SetUp()
    {
        Settings = TestSettings.Instance;
        Driver = DriverFactory.CreateDriver(Settings);
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(Settings.ImplicitWaitSeconds);
        Driver.Manage().Window.Maximize();
        Wait = new WaitHelpers(Driver, Settings);
    }

    [TearDown]
    public virtual void TearDown()
    {
        if (TestContext.CurrentContext.Result.Outcome.Status == TestStatus.Failed
            && Settings.ScreenshotOnFailure)
        {
            CaptureScreenshot();
        }
        Driver?.Quit();
        Driver?.Dispose();
    }

    protected void NavigateTo(string path)
    {
        var url = $"{Settings.BaseUrl}{path}";
        Driver.Navigate().GoToUrl(url);
        Wait.WaitForPageLoad();
    }

    protected void NavigateToAbsolute(string url)
    {
        Driver.Navigate().GoToUrl(url);
        Wait.WaitForPageLoad();
    }

    private void CaptureScreenshot()
    {
        try
        {
            if (Driver is not ITakesScreenshot screenshotDriver) return;

            var screenshotDir = Path.Combine(
                TestContext.CurrentContext.WorkDirectory,
                Settings.ScreenshotDirectory);
            Directory.CreateDirectory(screenshotDir);

            var testName = TestContext.CurrentContext.Test.FullName
                .Replace(".", "_").Replace("\"", "").Replace("(", "").Replace(")", "");
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var fileName = $"{testName}_{timestamp}.png";

            var screenshot = screenshotDriver.GetScreenshot();
            var filePath = Path.Combine(screenshotDir, fileName);
            screenshot.SaveAsFile(filePath);

            TestContext.AddTestAttachment(filePath, "Screenshot on failure");
        }
        catch (Exception ex)
        {
            TestContext.WriteLine($"Failed to capture screenshot: {ex.Message}");
        }
    }

    protected IReadOnlyCollection<LogEntry> GetBrowserLogs()
    {
        try
        {
            return Driver.Manage().Logs.GetLog(LogType.Browser);
        }
        catch
        {
            return Array.Empty<LogEntry>();
        }
    }
}
