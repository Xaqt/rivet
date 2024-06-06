import dayjs from 'dayjs';

/** A number of milliseconds (1/1000 of a second). */
export type Milliseconds = number & { __milliseconds: any };

/** Returns a number of milliseconds, strongly typed. */
export const ms = (numMilliseconds: number) => numMilliseconds as Milliseconds;

/** Returns a number of seconds, as milliseconds. */
export const seconds = (numSeconds: number) => ms(numSeconds * 1000);

/** Returns a number of minutes, as milliseconds. */
export const minutes = (numMinutes: number) => seconds(numMinutes * 60);

/** Returns a number of hours, as milliseconds. */
export const hours = (numHours: number) => minutes(numHours * 60);

/** Returns a number of days, as milliseconds. */
export const days = (numDays: number) => hours(numDays * 24);

/** A count of microseconds (1/1000) of a millisecond). */
export type Microseconds = number & { __microseconds: any };

/** Returns a number of microseconds, strongly typed. To type a µ, press option+m on mac os. */
export const µs = (numMicroseconds: number) => numMicroseconds as Microseconds;

export const formatDate = (timestamp: any) => {
  return dayjs(timestamp).format('MM-DD HH:mm');
};

type FormattedType = 'm-s' | 'h-m-s' | 'd-m h:s';
export const transformDate = (
  inputDate: string | number,
  type: FormattedType
) => {
  if (type === 'd-m h:s') {
    const dateObject = new Date(inputDate);
    return (
      ('0' + (dateObject.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + dateObject.getDate()).slice(-2) +
      ' ' +
      ('0' + dateObject.getHours()).slice(-2) +
      ':' +
      ('0' + dateObject.getMinutes()).slice(-2)
    );
  }
  if (type === 'm-s') {
    const totalSeconds = parseInt(inputDate.toString(), 10);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return (
      minutes.toString().padStart(2, '0') +
      ':' +
      seconds.toString().padStart(2, '0')
    );
  }
};
