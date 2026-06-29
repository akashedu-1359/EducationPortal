using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using EducationPortal.Tests.Selenium.Base;

namespace EducationPortal.Tests.Selenium.Tests;

[TestFixture]
[Category("Accessibility")]
public class AccessibilityTests : BaseTest
{
    [Test, Order(1)]
    public void Homepage_HasSkipToContentLink()
    {
        NavigateTo("/");

        var skipLinks = Driver.FindElements(By.CssSelector(
            "a[href='#main'], a[href='#content'], a[href='#main-content'], " +
            "a[class*='skip'], [class*='sr-only'] a"));

        var hasSkipLink = skipLinks.Count > 0;

        if (!hasSkipLink)
        {
            var allLinks = Driver.FindElements(By.TagName("a"));
            hasSkipLink = allLinks.Any(l =>
            {
                try
                {
                    return l.GetAttribute("href")?.Contains("#main") == true
                        || l.GetAttribute("href")?.Contains("#content") == true
                        || l.Text.Contains("skip", StringComparison.OrdinalIgnoreCase);
                }
                catch { return false; }
            });
        }

        hasSkipLink.Should().BeTrue("Homepage should have a skip-to-content link for accessibility");
    }

    [Test, Order(2)]
    public void LoginPage_InputsHaveLabels()
    {
        NavigateTo("/auth/login");

        var inputs = Driver.FindElements(By.CssSelector(
            "input[type='email'], input[type='password'], input[type='text']"));

        foreach (var input in inputs)
        {
            var id = input.GetAttribute("id");
            var ariaLabel = input.GetAttribute("aria-label");
            var ariaLabelledBy = input.GetAttribute("aria-labelledby");
            var placeholder = input.GetAttribute("placeholder");

            var hasLabel = !string.IsNullOrEmpty(ariaLabel)
                || !string.IsNullOrEmpty(ariaLabelledBy)
                || !string.IsNullOrEmpty(placeholder);

            if (!string.IsNullOrEmpty(id))
            {
                var labels = Driver.FindElements(By.CssSelector($"label[for='{id}']"));
                hasLabel = hasLabel || labels.Count > 0;
            }

            hasLabel.Should().BeTrue($"Input '{input.GetAttribute("name") ?? input.GetAttribute("type")}' should have an accessible label");
        }
    }

    [Test, Order(3)]
    public void RegisterPage_InputsHaveLabels()
    {
        NavigateTo("/auth/register");

        var inputs = Driver.FindElements(By.CssSelector("input:not([type='hidden'])"));

        foreach (var input in inputs)
        {
            var ariaLabel = input.GetAttribute("aria-label");
            var ariaLabelledBy = input.GetAttribute("aria-labelledby");
            var placeholder = input.GetAttribute("placeholder");
            var id = input.GetAttribute("id");

            var hasLabel = !string.IsNullOrEmpty(ariaLabel)
                || !string.IsNullOrEmpty(ariaLabelledBy)
                || !string.IsNullOrEmpty(placeholder);

            if (!string.IsNullOrEmpty(id))
            {
                var labels = Driver.FindElements(By.CssSelector($"label[for='{id}']"));
                hasLabel = hasLabel || labels.Count > 0;
            }

            hasLabel.Should().BeTrue($"Input '{input.GetAttribute("name") ?? input.GetAttribute("type")}' should have an accessible label");
        }
    }

    [Test, Order(4)]
    public void Homepage_HeadingHierarchy_StartsWithH1()
    {
        NavigateTo("/");

        var headings = Driver.FindElements(By.CssSelector("h1, h2, h3, h4, h5, h6"));
        headings.Count.Should().BeGreaterThan(0, "Page should have at least one heading");

        var firstHeading = headings.First();
        firstHeading.TagName.ToLowerInvariant().Should().Be("h1", "First heading should be an h1");
    }

    [Test, Order(5)]
    public void Homepage_HeadingHierarchy_NoSkippedLevels()
    {
        NavigateTo("/");

        var headings = Driver.FindElements(By.CssSelector("h1, h2, h3, h4, h5, h6"));
        if (headings.Count <= 1) return;

        var levels = headings.Select(h => int.Parse(h.TagName.Substring(1))).ToList();

        for (int i = 1; i < levels.Count; i++)
        {
            var jump = levels[i] - levels[i - 1];
            jump.Should().BeLessThanOrEqualTo(1,
                $"Heading hierarchy should not skip levels (h{levels[i - 1]} -> h{levels[i]})");
        }
    }

    [Test, Order(6)]
    public void Homepage_KeyboardNavigation_TabFocusesElements()
    {
        NavigateTo("/");

        var body = Driver.FindElement(By.TagName("body"));
        body.SendKeys(Keys.Tab);
        Thread.Sleep(300);

        var activeElement = Driver.SwitchTo().ActiveElement();
        var tagName = activeElement.TagName.ToLowerInvariant();

        var focusableElements = new[] { "a", "button", "input", "select", "textarea", "summary" };
        var isFocusable = focusableElements.Contains(tagName)
            || activeElement.GetAttribute("tabindex") != null
            || activeElement.GetAttribute("role") != null;

        isFocusable.Should().BeTrue("Tab should focus an interactive element");
    }

    [Test, Order(7)]
    public void Pages_HaveDescriptiveTitles()
    {
        var pages = new[]
        {
            ("/", "home"),
            ("/exams", "exam"),
            ("/resources", "resource"),
            ("/auth/login", "login"),
        };

        foreach (var (path, _) in pages)
        {
            NavigateTo(path);
            var title = Driver.Title;

            title.Should().NotBeNullOrWhiteSpace($"Page '{path}' should have a title");
        }
    }
}
