using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Edge;
using OpenQA.Selenium.Firefox;
using EducationPortal.Tests.Selenium.Config;

namespace EducationPortal.Tests.Selenium.Base;

public static class DriverFactory
{
    public static IWebDriver CreateDriver(TestSettings settings)
    {
        return settings.Browser.ToLowerInvariant() switch
        {
            "chrome" => CreateChromeDriver(settings),
            "firefox" => CreateFirefoxDriver(settings),
            "edge" => CreateEdgeDriver(settings),
            _ => throw new ArgumentException($"Unsupported browser: {settings.Browser}")
        };
    }

    private static IWebDriver CreateChromeDriver(TestSettings settings)
    {
        var options = new ChromeOptions();
        if (settings.Headless)
            options.AddArgument("--headless=new");

        options.AddArguments(
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--window-size=1920,1080",
            "--disable-extensions",
            "--disable-infobars",
            "--ignore-certificate-errors"
        );

        options.AddArgument("--enable-logging");
        options.SetLoggingPreference(LogType.Browser, LogLevel.Warning);

        var service = ChromeDriverService.CreateDefaultService();
        return new ChromeDriver(service, options);
    }

    private static IWebDriver CreateFirefoxDriver(TestSettings settings)
    {
        var options = new FirefoxOptions();
        if (settings.Headless)
            options.AddArgument("--headless");

        options.AddArgument("--width=1920");
        options.AddArgument("--height=1080");

        return new FirefoxDriver(options);
    }

    private static IWebDriver CreateEdgeDriver(TestSettings settings)
    {
        var options = new EdgeOptions();
        if (settings.Headless)
            options.AddArgument("--headless=new");

        options.AddArguments(
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--window-size=1920,1080"
        );

        return new EdgeDriver(options);
    }
}
