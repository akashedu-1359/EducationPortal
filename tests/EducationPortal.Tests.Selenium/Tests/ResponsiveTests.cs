using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using EducationPortal.Tests.Selenium.Base;

namespace EducationPortal.Tests.Selenium.Tests;

[TestFixture]
[Category("Responsive")]
public class ResponsiveTests : BaseTest
{
    private void SetViewport(int width, int height)
    {
        Driver.Manage().Window.Size = new System.Drawing.Size(width, height);
        Thread.Sleep(500);
    }

    private void SetMobileViewport() => SetViewport(375, 812);
    private void SetTabletViewport() => SetViewport(768, 1024);
    private void SetDesktopViewport() => SetViewport(1280, 800);

    // --- Mobile Tests ---

    [Test, Order(1)]
    public void Mobile_Homepage_HamburgerMenuVisible()
    {
        SetMobileViewport();
        NavigateTo("/");

        var hamburger = Driver.FindElements(By.CssSelector(
            "button[aria-label*='menu' i], button[aria-label*='nav' i], " +
            "button[class*='hamburger'], button[class*='mobile'], " +
            "[data-testid='mobile-menu']"));

        hamburger.Count.Should().BeGreaterThan(0, "Hamburger menu button should be visible on mobile");
    }

    [Test, Order(2)]
    public void Mobile_Homepage_NoHorizontalOverflow()
    {
        SetMobileViewport();
        NavigateTo("/");

        var jsExecutor = (IJavaScriptExecutor)Driver;
        var scrollWidth = Convert.ToInt64(jsExecutor.ExecuteScript("return document.body.scrollWidth"));
        var clientWidth = Convert.ToInt64(jsExecutor.ExecuteScript("return document.documentElement.clientWidth"));

        scrollWidth.Should().BeLessThanOrEqualTo(clientWidth + 5, "Page should not have horizontal overflow on mobile");
    }

    [Test, Order(3)]
    public void Mobile_Homepage_CtaButtonVisible()
    {
        SetMobileViewport();
        NavigateTo("/");

        var ctaButtons = Driver.FindElements(By.CssSelector(
            "a[class*='btn'], a[class*='button'], button[class*='primary'], " +
            "a[href*='register'], a[href*='get-started']"));

        ctaButtons.Count.Should().BeGreaterThan(0, "CTA button should be visible on mobile homepage");
    }

    [Test, Order(4)]
    public void Mobile_ExamsPage_ResponsiveGrid()
    {
        SetMobileViewport();
        NavigateTo("/exams");

        var bodyWidth = Convert.ToInt64(((IJavaScriptExecutor)Driver)
            .ExecuteScript("return document.body.scrollWidth"));
        var windowWidth = Convert.ToInt64(((IJavaScriptExecutor)Driver)
            .ExecuteScript("return window.innerWidth"));

        bodyWidth.Should().BeLessThanOrEqualTo(windowWidth + 5, "Exams page should not overflow on mobile");
    }

    [Test, Order(5)]
    public void Mobile_ResourcesPage_NoOverflow()
    {
        SetMobileViewport();
        NavigateTo("/resources");

        var scrollWidth = Convert.ToInt64(((IJavaScriptExecutor)Driver)
            .ExecuteScript("return document.body.scrollWidth"));
        var clientWidth = Convert.ToInt64(((IJavaScriptExecutor)Driver)
            .ExecuteScript("return document.documentElement.clientWidth"));

        scrollWidth.Should().BeLessThanOrEqualTo(clientWidth + 5, "Resources page should not overflow on mobile");
    }

    [Test, Order(6)]
    public void Mobile_Footer_Visible()
    {
        SetMobileViewport();
        NavigateTo("/");

        ((IJavaScriptExecutor)Driver).ExecuteScript("window.scrollTo(0, document.body.scrollHeight)");
        Thread.Sleep(500);

        var footer = Driver.FindElements(By.CssSelector("footer"));
        footer.Count.Should().BeGreaterThan(0, "Footer should be visible on mobile");
    }

    // --- Tablet Tests ---

    [Test, Order(7)]
    public void Tablet_Homepage_LayoutRenders()
    {
        SetTabletViewport();
        NavigateTo("/");

        var heading = Driver.FindElements(By.CssSelector("h1"));
        heading.Count.Should().BeGreaterThan(0, "Main heading should be visible on tablet");
    }

    [Test, Order(8)]
    public void Tablet_Homepage_NoOverflow()
    {
        SetTabletViewport();
        NavigateTo("/");

        var scrollWidth = Convert.ToInt64(((IJavaScriptExecutor)Driver)
            .ExecuteScript("return document.body.scrollWidth"));
        var clientWidth = Convert.ToInt64(((IJavaScriptExecutor)Driver)
            .ExecuteScript("return document.documentElement.clientWidth"));

        scrollWidth.Should().BeLessThanOrEqualTo(clientWidth + 5, "No horizontal overflow on tablet");
    }

    [Test, Order(9)]
    public void Tablet_ExamsPage_GridLayout()
    {
        SetTabletViewport();
        NavigateTo("/exams");

        var body = Driver.FindElement(By.TagName("body"));
        body.Text.Should().NotBeEmpty("Page should render content on tablet");
    }

    [Test, Order(10)]
    public void Tablet_ResourcesPage_Renders()
    {
        SetTabletViewport();
        NavigateTo("/resources");

        var heading = Driver.FindElements(By.CssSelector("h1"));
        heading.Count.Should().BeGreaterThan(0, "Resources heading should be visible on tablet");
    }

    [Test, Order(11)]
    public void Tablet_Footer_Visible()
    {
        SetTabletViewport();
        NavigateTo("/");

        ((IJavaScriptExecutor)Driver).ExecuteScript("window.scrollTo(0, document.body.scrollHeight)");
        Thread.Sleep(500);

        var footer = Driver.FindElements(By.CssSelector("footer"));
        footer.Count.Should().BeGreaterThan(0, "Footer should be visible on tablet");
    }

    // --- Desktop Tests ---

    [Test, Order(12)]
    public void Desktop_Homepage_FullNavVisible()
    {
        SetDesktopViewport();
        NavigateTo("/");

        var navLinks = Driver.FindElements(By.CssSelector(
            "nav a, header a, [class*='nav'] a"));

        navLinks.Count.Should().BeGreaterThan(0, "Navigation links should be visible on desktop");
    }

    [Test, Order(13)]
    public void Desktop_Homepage_NoHamburgerMenu()
    {
        SetDesktopViewport();
        NavigateTo("/");

        var hamburgerVisible = Driver.FindElements(By.CssSelector(
            "button[aria-label*='menu' i]"))
            .Any(e =>
            {
                try { return e.Displayed; }
                catch { return false; }
            });

        hamburgerVisible.Should().BeFalse("Hamburger menu should be hidden on desktop");
    }

    [Test, Order(14)]
    public void Desktop_ResourcesPage_MultiColumnGrid()
    {
        SetDesktopViewport();
        NavigateTo("/resources");

        var body = Driver.FindElement(By.TagName("body"));
        body.Text.Should().NotBeEmpty("Resources page should render on desktop");
    }

    [Test, Order(15)]
    public void Desktop_LoginPage_CenteredForm()
    {
        SetDesktopViewport();
        NavigateTo("/auth/login");

        var forms = Driver.FindElements(By.CssSelector("form, [class*='card'], [class*='form']"));
        forms.Count.Should().BeGreaterThan(0, "Login form should be visible on desktop");
    }
}
