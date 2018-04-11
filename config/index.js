// There are four parts to the configuration of you REST API:
// 	host: the base documentation path for Swagger (useful for proxying)
//  schemes: change to ['https'] if behind a https proxy
// 	port: the port for the server
// 	db: a list of database connection strings
// 	cache: cache settings for your services
// 	search: a configuration for the search services
//
// Search return columns must include the following:
// id       unique identifier for that search type
// type     the category of search (i.e. "address")
// label    the return value you want to sort by
//
// The search performs a union of all tables specified in the query,
// so to search for more than one table in a single query, the return
// columns for each table in that query *must* be the same.
//

module.exports = {
    schemes: ['http'],
    host: 'localhost',
    port: 8123,
    db: {
        postgis: 'postgres://webview:viewerasdf@apnsgis1/montgomery'
    },
    cache: {
        expiresIn: 30 * 1000,
        privacy: 'private'
    },
    search: {
        address: {
            table: 'parc_addr',
            columns: `objectid as id, propertyad as label, 'ADDRESS' as type, parcelpo_1 as lng, parcelpo_2 as lat, gislink as pid, propertyad as address`,
            where: `propertyad ilike ?`,
            format: function(query) { return '%' + query.trim() + '%'; 
            }
        },
        owner: {
            table: 'parc_addr',
            columns: `objectid as id, owner as label, 'OWNER' as type, parcelpo_1 as lng, parcelpo_2 as lat, gislink as pid, propertyad as address`,
            where: `owner ilike ?`,
            format: function(query) { return '%' + query.trim() + '%'; 
            }
        },
        park: {
            table: 'parks p, tax_parcels t',
            columns: `p.gid as id, prkname as label, 'PARK' as type, round(ST_X(ST_Transform(p.the_geom, 4326))::NUMERIC,4) as lng, round(ST_Y(ST_Transform(p.the_geom, 4326))::NUMERIC,4) as lat, t.pid as pid, prkaddr as address`,
            where: 'prkname ilike ? and p.the_geom && t.the_geom',
            format: function(query) {
                return '%' + query.trim() + '%';
            }
        },
        pid: {
            table: 'master_address_table',
            columns: `objectid as id, num_parent_parcel as label, 'TAX PARCEL' as type, round(ST_X(ST_Transform(the_geom, 4326))::NUMERIC,4) as lng, round(ST_Y(ST_Transform(the_geom, 4326))::NUMERIC,4) as lat, num_parent_parcel as pid, full_address as address`,
            where: `num_parent_parcel = ? and num_x_coord > 0 and cde_status='A'`,
            format: function(query) {
                return query.trim();
            }
        },
        library: {
            table: 'libraries l, tax_parcels p',
            columns: `l.gid as id, name as label, 'LIBRARY' as type, round(ST_X(ST_Transform(l.the_geom, 4326))::NUMERIC,4) as lng, round(ST_Y(ST_Transform(l.the_geom, 4326))::NUMERIC,4) as lat, p.pid as pid, address`,
            where: `name ilike ? and l.the_geom && p.the_geom`,
            format: function(query) {
                return '%' + query.trim() + '%';
            }
        },
        school: {
            table: 'schools s, tax_parcels p',
            columns: `s.gid as id, schlname as label, 'SCHOOL' as type, round(ST_X(ST_Transform(s.the_geom, 4326))::NUMERIC,4) as lng, round(ST_Y(ST_Transform(s.the_geom, 4326))::NUMERIC,4) as lat, p.pid as pid, address`,
            where: `schlname ilike ? and s.the_geom && p.the_geom`,
            format: function(query) {
                return '%' + query.trim() + '%';
            }
        }
    }
};
