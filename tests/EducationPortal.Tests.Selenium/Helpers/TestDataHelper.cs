namespace EducationPortal.Tests.Selenium.Helpers;

public static class TestDataHelper
{
    private static readonly Random Random = new();
    private static int _counter;

    /// <summary>
    /// Generate a unique email address for test user registration.
    /// </summary>
    public static string GenerateEmail(string prefix = "testuser")
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var count = Interlocked.Increment(ref _counter);
        return $"{prefix}+{timestamp}{count}@test.eduportal.com";
    }

    /// <summary>
    /// Generate a unique admin email address.
    /// </summary>
    public static string GenerateAdminEmail()
    {
        return GenerateEmail("admin");
    }

    /// <summary>
    /// A valid strong password for test accounts.
    /// </summary>
    public static string ValidPassword => "TestPassword1!";

    /// <summary>
    /// A weak password that should fail validation.
    /// </summary>
    public static string WeakPassword => "abc";

    /// <summary>
    /// A password that misses uppercase requirement.
    /// </summary>
    public static string NoUppercasePassword => "testpassword1!";

    /// <summary>
    /// A password that misses number requirement.
    /// </summary>
    public static string NoNumberPassword => "TestPassword!";

    /// <summary>
    /// Generate a unique first name.
    /// </summary>
    public static string GenerateFirstName() =>
        $"Test{Random.Next(100, 999)}";

    /// <summary>
    /// Generate a unique last name.
    /// </summary>
    public static string GenerateLastName() =>
        $"User{Random.Next(100, 999)}";

    /// <summary>
    /// Generate a unique full name.
    /// </summary>
    public static (string FirstName, string LastName) GenerateFullName()
    {
        return (GenerateFirstName(), GenerateLastName());
    }

    /// <summary>
    /// Generate a unique category name.
    /// </summary>
    public static string GenerateCategoryName() =>
        $"Category_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Random.Next(100, 999)}";

    /// <summary>
    /// Generate a unique exam title.
    /// </summary>
    public static string GenerateExamTitle() =>
        $"Exam_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Random.Next(100, 999)}";

    /// <summary>
    /// Generate a unique resource title.
    /// </summary>
    public static string GenerateResourceTitle() =>
        $"Resource_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";

    /// <summary>
    /// Generate a lorem ipsum description.
    /// </summary>
    public static string GenerateDescription(int words = 15)
    {
        var lorem = new[]
        {
            "This", "is", "a", "test", "description", "for", "automation",
            "testing", "purposes", "with", "enough", "content", "to",
            "validate", "the", "minimum", "length", "requirement",
            "for", "the", "form", "field", "in", "question"
        };

        return string.Join(" ", lorem.Take(Math.Min(words, lorem.Length)));
    }

    /// <summary>
    /// Generate a test slug.
    /// </summary>
    public static string GenerateSlug() =>
        $"test-item-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";

    /// <summary>
    /// A known-invalid email format.
    /// </summary>
    public static string InvalidEmail => "not-an-email";

    /// <summary>
    /// An email that almost certainly does not exist.
    /// </summary>
    public static string NonExistentEmail => $"nonexistent_{Guid.NewGuid():N}@nowhere.invalid";

    /// <summary>
    /// A slug that should return 404.
    /// </summary>
    public static string NonExistentSlug => $"non-existent-resource-{Guid.NewGuid():N}";

    /// <summary>
    /// A resource ID that should not exist.
    /// </summary>
    public static string NonExistentId => Guid.NewGuid().ToString();

    /// <summary>
    /// Common viewport sizes for responsive testing.
    /// </summary>
    public static class Viewports
    {
        public static (int Width, int Height) Mobile => (375, 812);
        public static (int Width, int Height) Tablet => (768, 1024);
        public static (int Width, int Height) Desktop => (1920, 1080);
        public static (int Width, int Height) SmallDesktop => (1280, 720);
    }

    /// <summary>
    /// Wait durations for various scenarios.
    /// </summary>
    public static class Delays
    {
        public static TimeSpan Short => TimeSpan.FromMilliseconds(500);
        public static TimeSpan Medium => TimeSpan.FromSeconds(2);
        public static TimeSpan Long => TimeSpan.FromSeconds(5);
        public static TimeSpan VeryLong => TimeSpan.FromSeconds(15);
    }
}
