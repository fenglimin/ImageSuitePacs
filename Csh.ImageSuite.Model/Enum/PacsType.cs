namespace Csh.ImageSuite.Model.Enum
{
    public enum PacsType
    {
        MiniPacs,

        WebPacs
    }

    public enum StudyDateType
    {
        QueryAllDates = 0,
        QueryToday,
        QuerySinceYesterday,
        QueryLast7Days,
        QueryLast30Days,
        QueryLast6Months,
        QueryLast12Months,
        DATERANGE
    }
}
