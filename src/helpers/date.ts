import dayjs, { ConfigType, Dayjs } from 'dayjs';
const FORMAT_BASE = 'YYYY-MM-DD';

export class DateWorker {
  _date: Dayjs;

  constructor(strDate?: string | Date) {
    this._date = strDate ? dayjs(strDate) : dayjs();
  }

  public format(format?: string): string {
    return dayjs().format(format ?? FORMAT_BASE);
  }

  public diff(date?: ConfigType, format?: string) {
    return this._date.diff(date), format;
  }
}
