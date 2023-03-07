/* eslint-disable react-native/no-inline-styles */
/* @flow */
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';

import conference from '../../conference';

import { PDFEvents } from './constants/events';


import { changePage } from './state/actions';

const EventEmitter = require('events');

export const pdfEvents = new EventEmitter();

type Props = {
    participantId: string,
    pdfFile: any,
    initPageIndex: any,
};

declare var APP: Object;

const PdfViewerComponent = (props: Props) => {
    const containerRef = useRef(null);
    const [ _lastScrollPosition, _setLastScrollPosition ] = useState<any>(null);
    const [ _instance, _setInstance ] = useState<any>(null);
    const [ _scroll, _setScroll ] = useState<any>(null);

    let PSPDFKit, instance;

    const lastScrollPositionRef = React.useRef(_lastScrollPosition);
    const setLastScrollPosition = data => {
        lastScrollPositionRef.current = data;
        _setLastScrollPosition(data);
    };

    const instanceRef = React.useRef(_instance);
    const setInstance = data => {
        instanceRef.current = data;
        _setInstance(data);
    };

    const scrollRef = React.useRef(_scroll);
    const setScroll = data => {
        scrollRef.current = data;
        _setScroll(data);
    };

    const handleScroll = e => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight * e.ratioY;
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth * e.ratioX;

        if (e.ratioX) {
            setLastScrollPosition({
                ...lastScrollPositionRef.current,
                ratioX: e.ratioX
            });
        }

        if (e.ratioY) {
            setLastScrollPosition({
                ...lastScrollPositionRef.current,
                ratioY: e.ratioY
            });
        }
    };

    const handleZoom = _.debounce(e => {
        if (instanceRef.current.currentZoomLevel !== e.value) {
            instanceRef.current.setViewState(viewState =>
                viewState.set('zoom', e.value)
            );
        }
    }, 500);

  

    useEffect(() => {
        if (props.initPageIndex && _instance) {
            _instance.setViewState(viewState =>
                viewState.set('currentPageIndex', props.initPageIndex)
            );
        }
    }, [ props.initPageIndex, _instance ]);

    const detectVisibleAnnotations = createdAnotation => {
        if (!createdAnotation?._tail?.array[0]) {
            return;
        }
        const annotationJSON = PSPDFKit.Annotations.toSerializableObject(
            createdAnotation?._tail?.array[0]
        );

        if (!annotationJSON?.customData?.ownerId) {
            conference.sendEndpointMessage('', {
                type: PDFEvents.ANOTATION,
                createdAnotation: {
                    ownerId: props.participantId,
                    ...annotationJSON
                }
            });
        }

    };

    const loadPdf = async file => {
        const container = containerRef.current;

        PSPDFKit = await import('pspdfkit');
        PSPDFKit.unload(container);
        instance = await PSPDFKit.load({
            // Container where PSPDFKit should be mounted.
            container,


            // The document to open.
            document: file,

            // Use the public directory URL as a base URL. PSPDFKit will download its library assets from here.
            baseUrl: 'https://meet.lettutor.com/static/'
        });

        setInstance(instance);

        instance.addEventListener(
            'viewState.currentPageIndex.change',
            detectVisibleAnnotations
        );
        instance.addEventListener(
            'annotations.create',
            detectVisibleAnnotations
        );
        instance.addEventListener(
            'annotations.update',
            detectVisibleAnnotations
        );
        instance.addEventListener(
            'annotations.delete',
            detectVisibleAnnotations
        );
        instance.addEventListener(
            'annotations.delete',
            detectVisibleAnnotations
        );

        const scrollKit = instance.contentDocument.querySelector(
            '.PSPDFKit-Scroll'
        );

        setScroll(scrollKit);
        const handleScrollEvent = _.debounce(() => {
            const pageIndex = instance.viewState.currentPageIndex;

            const data = APP.store.getState()['custom/live-teaching'];

            if (data?.pageIndex !== pageIndex) {

                APP.API.notifyPdfChanged({
                    eBookId: data?.eBookId,
                    topicId: data?.topicId,
                    pageIndex: data?.currentPageIndex
                });
            }
            APP.store.dispatch(changePage(pageIndex));

            const ratioY = scrollKit.scrollTop / scrollKit.scrollHeight;
            const ratioX = scrollKit.scrollLeft / scrollKit.scrollWidth;
            const lastRatioX = lastScrollPositionRef.current?.ratioX;
            const lastRatioY = lastScrollPositionRef.current?.ratioY;

            if (
                !lastScrollPositionRef.current
                || Math.round(ratioY * 100) !== Math.round(lastRatioY * 100)
                || (lastRatioX
                    && Math.round(ratioX * 100) !== Math.round(lastRatioX * 100))
            ) {
                conference.sendEndpointMessage('', {
                    type: PDFEvents.SCROLL,
                    pageIndex,
                    scrollTop: scrollKit.scrollTop,
                    scrollLeft: scrollKit.scrollLeft,
                    scrollHeight: scrollKit.scrollHeight,
                    scrollWidth: scrollKit.scrollWidth,
                    ratioY,
                    ratioX
                });
            }
        }, 100);

        const handleZoomEvent = e => {
            conference.sendEndpointMessage('', {
                type: PDFEvents.ZOOM,
                value: e
            });
        };

        instance.addEventListener('viewState.zoom.change', handleZoomEvent);

        scrollKit.addEventListener('scroll', handleScrollEvent);

        pdfEvents.on(PDFEvents.ZOOM, handleZoom);
        pdfEvents.on(PDFEvents.SCROLL, handleScroll);
        pdfEvents.on(PDFEvents.ANOTATION, async text => {
            if (text.type === 'anotation') {
                const annotation = PSPDFKit.Annotations.fromSerializableObject({
                    ...text.createdAnotation,
                    customData: { ownerId: text.createdAnotation.ownerId }
                });

                await instance.create(annotation);
            }
        });
    };

    useEffect(() => {
        if (props.pdfFile) {
            loadPdf(props.pdfFile);
            const pdfInfo = APP.store.getState()['custom/live-teaching'];
            const data = {
                fileUrl: props.pdfFile,
                eBookId: pdfInfo?.eBookId,
                topicId: pdfInfo?.topicId,
                pageIndex: pdfInfo?.currentPageIndex,
                changeType: 'file'
            };

            APP.API.notifyPdfChanged(data);
        }
    }, [ props.pdfFile, document ]);

    return (
        <div
            ref = { containerRef }
            style = {{
                height: '100%',
                width: '100%'

            }} />
    );
};

export default PdfViewerComponent;
