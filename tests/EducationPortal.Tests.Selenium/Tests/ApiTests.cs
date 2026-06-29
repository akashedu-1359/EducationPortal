using System.Net;
using FluentAssertions;
using NUnit.Framework;
using EducationPortal.Tests.Selenium.Base;
using EducationPortal.Tests.Selenium.Helpers;

namespace EducationPortal.Tests.Selenium.Tests;

[TestFixture]
[Category("Api")]
public class ApiTests : BaseTest
{
    private ApiHelper _api = null!;

    public override void SetUp()
    {
        base.SetUp();
        _api = new ApiHelper(Settings);
    }

    public override void TearDown()
    {
        _api?.Dispose();
        base.TearDown();
    }

    // --- Health ---

    [Test, Order(1)]
    public async Task Health_Endpoint_ReturnsOk()
    {
        var result = await _api.GetAsync("/api/health");

        result.Should().NotBeNull("Health endpoint should return a response");
        result!.IsSuccess.Should().BeTrue("Health endpoint should return success");
    }

    [Test, Order(2)]
    public async Task Health_Endpoint_ReturnsHealthyStatus()
    {
        var result = await _api.GetAsync("/api/health");

        result.Should().NotBeNull();
        result!.RawBody.Should().Contain("healthy", "Health response should contain 'healthy'");
    }

    // --- Auth ---

    [Test, Order(3)]
    public async Task Auth_Register_Endpoint_Exists()
    {
        var email = TestDataHelper.GenerateEmail("apitest");
        var result = await _api.PostAsync("/api/auth/register", new
        {
            email,
            password = "TestApi@123!",
            firstName = "Api",
            lastName = "Test"
        });

        result.Should().NotBeNull("Register endpoint should return a response");
        var validStatuses = new[] { HttpStatusCode.OK, HttpStatusCode.Created, HttpStatusCode.BadRequest, HttpStatusCode.Conflict };
        validStatuses.Should().Contain(result!.StatusCode, "Register endpoint should be reachable");
    }

    [Test, Order(4)]
    public async Task Auth_Login_Endpoint_Exists()
    {
        var result = await _api.PostAsync("/api/auth/login", new
        {
            email = "nonexistent@test.com",
            password = "wrongpassword"
        });

        result.Should().NotBeNull("Login endpoint should return a response");
        var validStatuses = new[] { HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.Unauthorized };
        validStatuses.Should().Contain(result!.StatusCode, "Login endpoint should be reachable");
    }

    [Test, Order(5)]
    public async Task Auth_Login_WithValidCredentials_ReturnsToken()
    {
        if (string.IsNullOrEmpty(Settings.UserEmail))
        {
            Assert.Ignore("User credentials not configured");
            return;
        }

        var result = await _api.LoginAsync(Settings.UserEmail, Settings.UserPassword);

        result.Should().NotBeNull("Login should return a response");
        result!.IsSuccess.Should().BeTrue("Login with valid credentials should succeed");
    }

    // --- Resources ---

    [Test, Order(6)]
    public async Task Resources_Endpoint_ReturnsData()
    {
        var result = await _api.GetAsync("/api/resources");

        result.Should().NotBeNull("Resources endpoint should return a response");
        result!.IsSuccess.Should().BeTrue("Resources endpoint should return success");
    }

    // --- CMS ---

    [Test, Order(7)]
    public async Task CmsSections_Endpoint_ReturnsData()
    {
        var result = await _api.GetAsync("/api/cms/sections");

        result.Should().NotBeNull("CMS sections endpoint should return a response");
        result!.IsSuccess.Should().BeTrue("CMS sections endpoint should return success");
    }

    [Test, Order(8)]
    public async Task CmsFeatures_Endpoint_ReturnsData()
    {
        var result = await _api.GetAsync("/api/cms/features");

        result.Should().NotBeNull("CMS features endpoint should return a response");
        var validStatuses = new[] { HttpStatusCode.OK, HttpStatusCode.NotFound };
        validStatuses.Should().Contain(result!.StatusCode, "CMS features endpoint should be reachable");
    }

    [Test, Order(9)]
    public async Task CmsFooter_Endpoint_ReturnsData()
    {
        var result = await _api.GetAsync("/api/cms/footer");

        result.Should().NotBeNull("CMS footer endpoint should return a response");
        var validStatuses = new[] { HttpStatusCode.OK, HttpStatusCode.NotFound };
        validStatuses.Should().Contain(result!.StatusCode, "CMS footer endpoint should be reachable");
    }

    [Test, Order(10)]
    public async Task CmsFaqs_Endpoint_ReturnsData()
    {
        var result = await _api.GetAsync("/api/cms/faqs");

        result.Should().NotBeNull("CMS FAQs endpoint should return a response");
        var validStatuses = new[] { HttpStatusCode.OK, HttpStatusCode.NotFound };
        validStatuses.Should().Contain(result!.StatusCode, "CMS FAQs endpoint should be reachable");
    }

    // --- Auth-Protected Endpoints ---

    [Test, Order(11)]
    public async Task UserDashboard_Returns401_WithoutToken()
    {
        using var unauthApi = new ApiHelper(Settings);
        var result = await unauthApi.GetAsync("/api/user/dashboard");

        result.Should().NotBeNull();
        result!.StatusCode.Should().Be(HttpStatusCode.Unauthorized, "Dashboard API should require auth");
    }

    [Test, Order(12)]
    public async Task AdminUsers_Returns401_WithoutToken()
    {
        using var unauthApi = new ApiHelper(Settings);
        var result = await unauthApi.GetAsync("/api/admin/users");

        result.Should().NotBeNull();
        result!.StatusCode.Should().Be(HttpStatusCode.Unauthorized, "Admin users API should require auth");
    }

    [Test, Order(13)]
    public async Task AuthRefresh_Returns401_WithoutCookie()
    {
        using var unauthApi = new ApiHelper(Settings);
        var result = await unauthApi.PostAsync("/api/auth/refresh", new { });

        result.Should().NotBeNull();
        var validStatuses = new[] { HttpStatusCode.Unauthorized, HttpStatusCode.BadRequest };
        validStatuses.Should().Contain(result!.StatusCode, "Refresh without cookie should fail");
    }
}
