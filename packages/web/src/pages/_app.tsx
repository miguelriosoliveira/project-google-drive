import type { AppProps } from 'next/app';

import '../styles/globals.scss';

// eslint-disable-next-line react/function-component-definition
export default function MyApp({ Component, pageProps }: AppProps) {
	// eslint-disable-next-line react/jsx-props-no-spreading
	return <Component {...pageProps} />;
}
