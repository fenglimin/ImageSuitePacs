import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor() { }

    error(log: string) {
        this.logInternal(log, 'E');
    }

    warning(log: string) {
        this.logInternal(log, 'W');
    }

    info(log: string) {
        this.logInternal(log, 'I');
    }

    debug(log: string) {
        this.logInternal(log, 'D');
    }

    seperator() {
        console.log('');
    }

    private formatNumberToString(num: number, maxLen: number = 2): string {
        if (maxLen == 2) {
            return num < 10 ? '0' + num : '' + num;
        } else {
            return num < 10 ? '00' + num : num < 100 ? '0' + num  : '' + num;
        }
        
    }

    private logInternal(log: string, level: string) {
        const cur = new Date();
        const timeStamp = cur.getFullYear() + '-' + this.formatNumberToString(cur.getMonth() + 1) + '-' + this.formatNumberToString(cur.getDate())
            + ' ' + this.formatNumberToString(cur.getHours()) + ':' + this.formatNumberToString(cur.getHours())
            + ':' + this.formatNumberToString(cur.getSeconds()) + '.' + this.formatNumberToString(cur.getMilliseconds(), 3);

        const content = timeStamp + ' ' + level + ' ' + log;
        console.log(content);
    }

}
