using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using EducationPortal.Tests.Selenium.Base;
using EducationPortal.Tests.Selenium.Helpers;
using EducationPortal.Tests.Selenium.Pages.Checkout;

namespace EducationPortal.Tests.Selenium.Tests;

[TestFixture]
[Category("Checkout")]
[Order(6)]
public class CheckoutTests : BaseTest
{
    private CheckoutPage _checkoutPage = null!;
    private CheckoutSuccessPage _successPage = null!;
    private AuthHelper _authHelper = null!;
    private const string TestResourceId = "1";

    public override void SetUp()
    {
        base.SetUp();
        _checkoutPage = new CheckoutPage(Driver);
        _successPage = new CheckoutSuccessPage(Driver);
        _authHelper = new AuthHelper(Driver);
    }

    private void LoginAndNavigateToCheckout()
    {
        if (string.IsNullOrEmpty(Settings.UserEmail))
        {
            Assert.Ignore("No test user configured.");
            return;
        }
        _authHelper.LoginAsTestUser();
        _checkoutPage.NavigateTo(TestResourceId);
    }

    [Test, Order(1)]
    [Description("Checkout page loads for valid resource")]
    public void Checkout_Page_Should_Load()
    {
        LoginAndNavigateToCheckout();

        var body = Driver.FindElement(By.TagName("body"));
        body.Text.Should().NotBeNullOrEmpty("Checkout page should have content");
    }

    [Test, Order(2)]
    [Description("Checkout page shows heading")]
    public void Checkout_Should_Show_Heading()
    {
        LoginAndNavigateToCheckout();

        var hasHeading = _checkoutPage.IsPageLoaded()
            || Driver.FindElements(By.CssSelector("h1, h2")).Count > 0;

        hasHeading.Should().BeTrue("Checkout page should have a heading");
    }

    [Test, Order(3)]
    [Description("Checkout page shows payment method selector")]
    public void Checkout_Should_Show_Payment_Method()
    {
        LoginAndNavigateToCheckout();

        var hasPayment = _checkoutPage.HasPaymentMethodSelector()
            || _checkoutPage.IsPayNowButtonDisplayed()
            || Driver.FindElement(By.TagName("main")).Text
                .Contains("payment", StringComparison.OrdinalIgnoreCase);

        hasPayment.Should().BeTrue("Checkout should show payment method or pay button");
    }

    [Test, Order(4)]
    [Description("Checkout page shows security badge")]
    public void Checkout_Should_Show_Security_Badge()
    {
        LoginAndNavigateToCheckout();

        var hasSecurity = _checkoutPage.IsSecurityBadgeDisplayed()
            || Driver.FindElement(By.TagName("body")).Text
                .Contains("secure", StringComparison.OrdinalIgnoreCase);

        hasSecurity.Should().BeTrue("Checkout should indicate secure transaction");
    }

    [Test, Order(5)]
    [Description("Checkout page has back link")]
    public void Checkout_Should_Have_Back_Link()
    {
        LoginAndNavigateToCheckout();

        _checkoutPage.IsBackLinkDisplayed().Should().BeTrue("Checkout should have a back link");
    }

    [Test, Order(6)]
    [Description("Unauthenticated user is redirected from checkout")]
    public void Checkout_Should_Redirect_Unauthenticated_User()
    {
        NavigateTo($"/checkout/{TestResourceId}");
        Thread.Sleep(3000);

        var redirected = Driver.Url.Contains("/auth/login") || Driver.Url.Contains("/auth");
        redirected.Should().BeTrue("Unauthenticated user should be redirected to login from checkout");
    }

    [Test, Order(7)]
    [Description("Checkout success page renders")]
    public void Checkout_Success_Page_Should_Render()
    {
        if (string.IsNullOrEmpty(Settings.UserEmail))
        {
            Assert.Ignore("No test user configured.");
            return;
        }
        _authHelper.LoginAsTestUser();
        _successPage.NavigateTo();

        var body = Driver.FindElement(By.TagName("body"));
        body.Text.Should().NotBeNullOrEmpty("Success page should have content");
    }

    [Test, Order(8)]
    [Description("Checkout success page has navigation links")]
    public void Checkout_Success_Should_Have_Navigation_Links()
    {
        if (string.IsNullOrEmpty(Settings.UserEmail))
        {
            Assert.Ignore("No test user configured.");
            return;
        }
        _authHelper.LoginAsTestUser();
        _successPage.NavigateTo();

        var hasNavLinks = _successPage.IsGoToMyContentDisplayed()
            || _successPage.IsBrowseMoreDisplayed()
            || Driver.FindElements(By.CssSelector("main a")).Count > 0;

        hasNavLinks.Should().BeTrue("Success page should have navigation links");
    }
}
