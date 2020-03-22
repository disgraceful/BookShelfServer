import FormatBookService from "./formatBaseService";

class FormatSeriesService extends FormatBookService {
    constructor() {
        super();
    }

    formatSeriesAuthor(author) {
        return author.name._text;
    }

    formatSeriesForAuthorPage(series) {
        const mapped = series
            .filter((item, i, self) => {
                return i === self.findIndex(elem => {
                    const elemTitle = elem.series.title._cdata;
                    const itemTitle = item.series.title._cdata;
                    return elemTitle.toLowerCase() === itemTitle.toLowerCase();
                })
            })
            .map(item => {
                return {
                    id: item.series.id._text,
                    title: item.series.title._cdata,
                    rating: item.work.ratings_sum._text
                }
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
