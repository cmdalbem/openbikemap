import mapboxgl from 'mapbox-gl'

import './MapPopups.css'


class MapPopups {
    map;

    popup;
    commentPopup;
    poiPopup;

    constructor(map) {
        this.map = map;

        // "closeOnClick: false" enables chaining clicks continually
        //   from POI to POI, otherwise clicking on another POI would
        //   just close the popup from the previous one.
        this.cyclewayPopup = new mapboxgl.Popup({
            closeOnClick: false
        });
        this.cyclewayPopup.on('close', e => {
            if (this.selectedCycleway) {
                this.map.setFeatureState({ source: 'osm', id: this.selectedCycleway }, { hover: false });
            }
            this.selectedCycleway = null;
        });

        this.commentPopup = new mapboxgl.Popup({
            closeOnClick: false,
            offset: 25
        });

        this.poiPopup = new mapboxgl.Popup({
            closeOnClick: false,
            offset: 25
        });
    }

    getFooter(osmUrl, color='black') {
        return `
            <div class="-ml-4 -mr-4 border border-b-0 border-${color} border-opacity-25 mt-10">
            </div>
            
            <div class="-mb-2 mt-2">
                <div class="opacity-50 mb-2">
                    Acha que este dado pode ser melhorado?
                </div>
                
                <a class="text-${color} border border-opacity-25 border-${color} px-2 py-1 rounded-sm mr-2"
                    target="_BLANK" rel="noopener"
                    href="${osmUrl}"
                >
                    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="react-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>    
                    Editar no OSM
                </a>

                <a  href="#"
                    class="text-${color} border border-opacity-25 border-${color} px-2 py-1 rounded-sm"
                    onClick="document.dispatchEvent(new Event('newComment'));"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="react-icon"><path fill-rule="evenodd" clip-rule="evenodd" d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H8L3 22V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15ZM13 14V11H16V9H13V6H11V9H8V11H11V14H13Z"></path></svg>
                    Comentar
                </a>
            </div>
        `;
    }

    showCommentPopup(e) {
        const coords = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        let html = `
            <div style="color: gray;">
                ${new Date(properties.createdAt).toLocaleString('pt-br')}
            </div>

            <div style="
                margin-top: 1em;
                font-size: 18px;">
                ${properties.text}
            </div>
        `;

        if (properties.tags) {
            // Arrays and objects get serialized by Mapbox system
            properties.tags = JSON.parse(properties.tags);

            html += `
                <div style="
                    margin-top: 2em;
                    font-size: 14px;
                    font
                ">
            `;
            
            properties.tags.forEach( t => {
                html += `
                    <div class="inline-block py-1 px-3 rounded-full border-gray-700 border mt-2 text-xs">
                        ${t}
                    </div>
                `;
            })
            
            html += `</div>`;
        }

        this.commentPopup.setLngLat(coords)
            .setHTML(html)
            .addTo(this.map);
    }

    showPOIPopup(e, iconSrc) {
        // const coords = e.features[0].geometry.coordinates.slice();
        const coords = e.lngLat;
        const properties = e.features[0].properties;
        const osmUrl = `https://www.openstreetmap.org/${properties.id}`;

        const translations = {
            // Bicicletarios
            name: '',
            operator: '',
            covered: 'Coberto',
            access: 'Acesso',
            capacity: 'Capacidade',
            cyclestreets_id: '',
            maxstay: '',
            surveillance: 'Vigilado',
            supervised: 'Supervisionado',
            lit: 'Iluminado',
            website: 'Site',
            opening_hours: 'Horários de funcionamento',
            bicycle_parking: 'Tipo',
            email: 'Email',

            // Bike sharing
            ref: 'Referência',
            network: 'Rede',
            description: 'Descrição',
            'payment:credit_cards': '',

            // Lojas & oficinas
            repair: '',
            second_hand: '',
            wheelchair: '',
            phone: 'Telefone',
            start_date: 'Desde',
            'service:bicycle:retail': 'Serviço de vendas',
            'service:bicycle:repair': 'Serviço de conserto',
            'service:bicycle:rental': 'Serviço de aluguel',
            'service:bicycle:pump': 'Serviço de bomba',
            'service:bicycle:diy': 'Serviço de DIY',
            'service:bicycle:cleaning': 'Serviço de limpeza',
            'service:bicycle:second_hand': 'Serviço de revenda',
            'service:bicycle:charging': 'Serviço de carregamento',

            // Generic
            yes: 'Sim',
            no: 'Não',
            free: 'Grátis',
            fee: 'Pago',
            only: 'Somente isso',
        }

        // console.debug(e);
        // console.debug(properties);

        let html = `
            <div class="text-2xl leading-tight mt-3 mb-5">
                <img src="${iconSrc}" class="inline-block" alt=""/> ${properties.name ? properties.name : ''}
            </div>

            <div class="mt-2 text-sm">
                ${Object.keys(properties).map(key => {
                    const name = translations[key];
                    const untranslatedValue = properties[key];
                    const value = translations[untranslatedValue];

                    switch(key) {
                        case 'id': 
                        case 'amenity': 
                        case 'source':
                        case 'name':
                        case 'operator':
                        case 'shop':
                        case 'alt_name':
                        case 'addr:housenumber':
                        case 'addr:street':
                        case 'addr:postcode':
                        case 'addr:unit':
                        case 'addr:city':
                        case 'addr:suburb':
                        case 'internet_access':
                        case 'internet_access:key':
                        case 'internet_access:ssid':
                            return '';
                        
                        default: 
                            return [
                                `${name || key}`,
                                `${value || untranslatedValue}`
                            ];
                    }
                })
                .map(i => i ? `
                    <div class="mt-2">
                        <div class="text-xs font-bold tracking-wider uppercase text-gray-600">
                            ${i[0]}
                        </div>
                        <div>
                            ${i[1]}
                        </div>
                    </div>` : '')
                .join('')}
            </div>

            ${this.getFooter(osmUrl, 'white')}
        `;

        this.poiPopup.setLngLat(coords)
            .setHTML(html)
            .addTo(this.map);
    }

    showCyclewayPopup(e, layer) {
        const coords = e.lngLat;
        const properties = e.features[0].properties;
        
        const osmUrl = `https://www.openstreetmap.org/${properties.id}`;

        const bgClass = layer.id;

        let html = `
            <div class="text-black">
                <div class="text-2xl leading-tight mt-3 mb-5">
                    ${properties.name ?
                        properties.name :
                        '<span class="italic opacity-50">Via sem nome</span>'}
                </div>

                <div
                    class="inline-block py-1 px-3 rounded-full bg-black"
                    style="color: ${layer.style.lineColor}"
                >
                    ${layer.name}
                </div>

                ${this.getFooter(osmUrl)}
            </div>
        `;

        // const prettyProps = JSON.stringify(props, null, 2)
        //     .replace(/(?:\r\n|\r|\n)/g, '<br/>')
        //     .replace(/"|,|\{|\}/g, '');
        // html += prettyProps;

        this.cyclewayPopup
            .setLngLat(coords)
            .setHTML(html)
            .addTo(this.map);
        this.cyclewayPopup.addClassName(bgClass); 
    }

    hidePopup() {
        this.cyclewayPopup.remove();
    }
}

export default MapPopups;