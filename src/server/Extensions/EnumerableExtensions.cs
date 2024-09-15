namespace WordSproutApi.Extensions;

public static class EnumerableExtensions
{
    public static int IndexOf<T>(this IEnumerable<T> source, Func<T, bool> predicate)
    {
        if (source == null || predicate == null)
            throw new ArgumentNullException(source == null ? nameof(source) : nameof(predicate));

        var index = 0;
        foreach (var item in source)
        {
            if (predicate(item))
                return index;

            index++;
        }

        return -1;
    }
}
