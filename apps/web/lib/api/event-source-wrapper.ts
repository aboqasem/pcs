/* eslint-disable @typescript-eslint/no-explicit-any */

import { config } from '@/lib/config';
import { HttpError, ValidationError } from '@pcs/shared-data-access';

export class EventSourceWrapper<TData = any> {
  private es: EventSource;

  private retries = 0;

  public onmessage: ((this: EventSource, ev: MessageEvent<TData>) => any) | null = null;

  public onerror:
    | ((this: EventSource, ev: MessageEvent<HttpError | ValidationError>) => any)
    | null = null;

  public onclose: ((end?: boolean) => void) | null = null;

  constructor(
    private readonly url: string,
    private readonly eventSourceInitDict?: EventSourceInit | undefined,
  ) {
    if (!url.startsWith('http')) {
      this.url = `${config.BFF_URL}${url}`;
    }

    this.es = new EventSource(this.url, {
      ...this.eventSourceInitDict,
      withCredentials: this.eventSourceInitDict?.withCredentials ?? true,
    });

    this.es.onmessage = (ev: MessageEvent) => {
      const evData = JSON.parse(ev.data);

      if (evData.data) {
        this.retries = 0;

        if (evData.data === '__END_OF_EVENT_STREAM__') {
          return this.close(true);
        }

        if (this.onmessage) {
          ev = new MessageEvent(ev.type, {
            ...ev,
            ports: [...ev.ports],
            data: evData.data,
          });

          this.onmessage.bind(this.es)(ev);
        }
      } else if (evData.error) {
        this.retries += 1;

        let error: HttpError | ValidationError;

        const status = evData.error?.statusCode;
        const message =
          evData.error?.message || evData.error?.error || 'An unexpected error occurred';
        console.warn(evData.error || message);

        if (status == 500) {
          error = new HttpError(
            'Something went wrong while trying to reach our servers, please try again later',
            status,
          );
        } else if (typeof message === 'object') {
          // it is a props error (object) from the validation process, we wrap it to determine its type
          error = new ValidationError(message, status);
        } else {
          error = new HttpError(message, status);
        }

        if ((error.status && error.status >= 400 && error.status < 500) || this.retries > 2) {
          this.close();
        }

        if (this.onerror) {
          ev = new MessageEvent(ev.type, {
            ...ev,
            ports: [...ev.ports],
            data: error,
          });

          this.onerror.bind(this.es)(ev);
        }
      }
    };

    this.es.onerror = (ev: Event) => {
      this.close();
      this.onerror?.bind(this.es)(
        new MessageEvent('error', {
          ...ev,
          data: new HttpError('An unexpected error occurred'),
        }),
      );
    };
  }

  public close(end?: boolean): void {
    this.onclose?.(end);
    return this.es.close();
  }
}
