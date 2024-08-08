import { useAnimation } from 'framer-motion'
import {
	getPagePrefooter,
	getDocumentByUID,
	getPrismicPaths
} from '@/lib/prismic'
import getGlobalData from '@/root/lib/cache/global-data'
import { NextSeo } from 'next-seo'
import { addSwiftypeDetails } from "@/lib/utils/addSwiftypeDetails"
import { getMainCategory } from '@/lib/utils/getMainCategory'
import { useRouter } from 'next/router'
import websitejsonld from '@/data/json_ld/website'
import Script from 'next/script'
import Head from 'next/head'
import { localesForHreflangs as locales, localeToSlug as localeSlug } from '@/lib/locales'

export default function Newsletter({ page, readingTime, globalData: {unlockForm}, hreflangs }) {
	const router = useRouter()
	const currentPath = router.asPath
	const animationControls = useAnimation()
	const animationVariants = {
		visible: { opacity: 1 },
		hidden: { opacity: 0 },
	}

	return (
		<>
			<NextSeo
				title={page?.newsletter_topic || page?.full_name?.[0]?.text}
				description={page?.seo_description || page?.intro_blurb?.[0]?.text}
				canonical={
					page?.canonical_overwrite
						? page?.canonical_overwrite
						: `https://thedecisionlab.com${router.asPath}`
				}
				openGraph={{
					url: page?.canonical_overwrite
						? page?.canonical_overwrite
						: `https://thedecisionlab.com${router.asPath}`,
					type: 'article',
				}}
			/>

			{/* Twitter Estimated read time */}
			<Head>
				{page?.tags?.length && <meta name="cluster-tags" content={page?.tags} />}
				{addSwiftypeDetails(page, '', readingTime, 'Thinker', getMainCategory(page))}
				{readingTime && (
					<>
						<meta name="twitter:label1" content="Est. reading time" />
						<meta
							name="twitter:data1"
							content={`${readingTime} ${readingTime > 1 ? 'minutes' : 'minute'}`}
						/>
					</>
				)}
				{hreflangs.map(({ rel, hreflang, href }) => (
					<link key={href} rel={rel} hrefLang={hreflang} href={href} />
				))}
			</Head>

			<Script
				id="json-ld"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'http://schema.org',
						'@type': 'WebPage',
						'@id': page?.canonical_overwrite
							? `${page?.canonical_overwrite}/#webpage`
							: `https://thedecisionlab.com${router.asPath}/#webpage`,
						url: page?.canonical_overwrite
							? page?.canonical_overwrite
							: `https://thedecisionlab.com${router.asPath}`,
						name: page?.seo_title ? page?.seo_title : '',
						datePublished: page?.first_publication_date,
						dateModified: page?.last_publication_date,
						description: page?.seo_description ? page?.seo_description : '',
						inLanguage: 'en-CA',
						isPartOf: websitejsonld,
						primaryImageOfPage: {
							'@type': 'ImageObject',
							'@id': `https://thedecisionlab.com${router.asPath}/#primaryimage`,
							inLanguage: 'en-CA',
							url: page?.headshot?.url,
							width: page?.headshot?.dimensions?.width,
							height: page?.headshot?.dimensions?.height,
							caption: page?.headshot?.alt
						},
						potentialAction: {
							'@type': 'ReadAction',
							target: {
								'@type': 'EntryPoint',
								urlTemplate: `https://thedecisionlab.com${router.asPath}`
							}
						}
					})
				}}
			/>

			<main className="main-pt">
				<article id="content">
					{page.html_code ? <div dangerouslySetInnerHTML={{ __html: page.html_code }} /> : null}
				</article>

			</main>
		</>
	)
}

export const getStaticProps = async ({ params }) => {
	// Page
	const page = await getDocumentByUID('newsletter', params?.uid[0])

	const subSlug = "newsletters";
	const slug = Array.isArray(params.uid) ? params.uid.join("/") : params.uid;
	const validSlug = subSlug+"/"+slug;

	const hreflangs = [];

	hreflangs.push({
		rel: "alternate",
		hreflang: `x-default`,
		href: `https://thedecisionlab.com/${validSlug}`
	});

	if (page.alternate_languages && page.alternate_languages.length > 0) {
    page.alternate_languages.forEach(language => {
        const hreflang = locales[language.lang];
        const slug = localeSlug[language.lang];
        const href = language.lang !== "en-ca" 
            ? `https://thedecisionlab.com/${slug}/${validSlug}` 
            : `https://thedecisionlab.com/${validSlug}`;
        
        hreflangs.push({
            rel: "alternate",
            hreflang: hreflang,
            href: href
        });
    });
	}
	
	hreflangs.sort((a, b) => {
    if (a.hreflang === "x-default") return -1;
    if (b.hreflang === "x-default") return 1;
    return a.hreflang.localeCompare(b.hreflang);
	});

	// Global Data
	const globalData = await getGlobalData()

	// Prefooter
	const prefooter = await getPagePrefooter(page)

	return {
		props: {
			page,
			globalData,
			prefooter,
			layout: 'BareLayout',
			hreflangs
		}
	}
}

export const getStaticPaths = async () => {
	const { paths: prismicPaths } = await getPrismicPaths({
		docTypes: ['newsletter'],
	})

	const paths = prismicPaths.map(path => {
		return {
		  params: {
			uid: Array.isArray(path.params.uid) ? path.params.uid : [path.params.uid]
		  }
		};
	  });

	return {
		paths,
		fallback: false
	}
}
