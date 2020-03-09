import FormatBookService from "./formatBaseService";

class FormatSeriesService extends FormatBookService {
    constructor() {
        super();
    }

    formatSeriesForAuthorPage(series) {
        const mapped = series
            .map(item => {
                return {
                    id: item.series.id._text,
                    title: item.series.title._cdata,
                    rating: item.work.ratings_sum._text
                }
            })
            .filter((item, i, self) => {
                return i === self.findIndex(e => e.title.toLowerCase().trim() === item.title.toLowerCase().trim());
            })
            .sort((a, b) => b.rating - a.rating);
        return mapped;
    }

    formatSeriesForSeriesPage(series) {
        const result = {
            id: series.id._text,
            title: series.title._cdata,
            workCount: series.primary_work_count._text,
            allWorks: series.series_works_count._text,
        }
        result.bookIds = this.formatSeriesWork(series, result.workCount);
        return result;
    }

    formatSeriesWork(series, workCount) {
        const seriesWork = series.series_works.series_work;
        let result = seriesWork.slice(0, workCount);
        return result.map(work => {
            let book = work.work.best_book
            return book.id._text;
        });
    }
}

export default FormatSeriesService;
