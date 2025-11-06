import { NextRequest, NextResponse } from 'next/server';
import { detectLinkType } from '@/helpers/detectLinkType';
import { pool } from '@/lib/db'
import { log } from "@/lib/logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { orgDataByWeb } from '@/helpers/apolloApi';

async function orgData(domain: string) {
  const [rows]: any = await pool.query(
    "SELECT id, name, logo_url, website, linkedin_url FROM organizations WHERE domain = ?", 
    [domain]
  );
  const orgFromDB = rows?.[0];
  
  if (orgFromDB) {
    return {
      orgName: orgFromDB.name,
      orgID: orgFromDB.id,
      orgLogo: orgFromDB.logo_url,
      orgWebsite: orgFromDB.website,
      orgEmail: '',
      linkedin: orgFromDB.linkedin_url,
    };
  } else {
    const webData = await orgDataByWeb(domain);
    const orgData = webData?.organization;
    
    if (orgData) {
      const query = `INSERT INTO organizations (used_api, hash_id, name, website, blog_url, angellist_url, linkedin_url, twitter_url, facebook_url, primary_phone, languages, keywords, industries, funding_events, suborganizations, departmental_head_count, alexa_ranking, linkedin_uid, founded_year, logo_url, domain, sanitized_phone, industry, estimated_num_employees, organization_revenue, raw_address, street_address, city, state, postal_code, country, total_funding, latest_funding_round_date, latest_funding_stage, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      const values = [
        'apollo',                                                       // used_api
        orgData.id,                                                      // hash_id
        orgData.name,                                                    // name
        orgData.website_url,                                            // website
        orgData.blog_url,                                               // blog_url
        orgData.angellist_url,                                          // angellist_url
        orgData.linkedin_url,                                           // linkedin_url
        orgData.twitter_url,                                            // twitter_url
        orgData.facebook_url,                                           // facebook_url
        JSON.stringify(orgData.primary_phone || {}),                    // primary_phone - store as JSON object
        JSON.stringify(orgData.languages || []),                        // languages
        JSON.stringify(orgData.keywords || []),                         // keywords
        JSON.stringify(orgData.industries || []),                       // industries
        JSON.stringify(orgData.funding_events || []),                   // funding_events
        JSON.stringify(orgData.suborganizations || []),                 // suborganizations
        JSON.stringify(orgData.departmental_head_count || {}),          // departmental_head_count
        orgData.alexa_ranking,                                          // alexa_ranking
        orgData.linkedin_uid,                                           // linkedin_uid
        orgData.founded_year,                                           // founded_year
        orgData.logo_url,                                               // logo_url
        domain,                                                          // domain
        orgData.sanitized_phone,                                        // sanitized_phone
        orgData.industry,                                               // industry
        orgData.estimated_num_employees,                                // estimated_num_employees
        orgData.organization_revenue,                                   // organization_revenue
        orgData.raw_address,                                            // raw_address
        orgData.street_address,                                         // street_address
        orgData.city,                                                   // city
        orgData.state,                                                  // state
        orgData.postal_code,                                            // postal_code
        orgData.country,                                                // country
        orgData.total_funding,                                          // total_funding
        orgData.latest_funding_round_date,                              // latest_funding_round_date
        orgData.latest_funding_stage,                                   // latest_funding_stage
        new Date()                                                       // created_at
      ];
      
      const [inserted] = await pool.query(query, values);
      console.log('Inserted new organization with ID:', inserted);
      log.info('Inserted new org data into DB', { domain, inserted });
      
      return {
        orgName: orgData.name || "",
        orgID: orgData.id || "",
        orgLogo: orgData.logo_url || "",
        orgWebsite: orgData.website_url || "",
        orgEmail: "",
        linkedin: orgData.linkedin_url || "",
      };
    } else {
      log.warn('No org data fetched from web', { domain });
      return {
        orgName: "",
        orgID: "",
        orgLogo: "",
        orgWebsite: "",
        orgEmail: "",
        linkedin: "",
      };
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    let session = null;
    let user_id = null;
    const body = await request.json();
    const { previewLink } = body;

    if (!previewLink) {
      return NextResponse.json(
        { error: 'previewLink is required' },
        { status: 400 }
      );
    }
    const userIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    session = await getServerSession(authOptions);

    log.info('Received preview link request', { previewLink, userAgent: request.headers.get('user-agent'), userIP: userIP });
    if (!session) {
      log.error('Unauthorized access to preview link API', { previewLink, userAgent: request.headers.get('user-agent'), userIP: userIP });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    user_id = session.user.id;
    let appRes;

    const linkType = detectLinkType(previewLink);

    if (linkType.type === 'invalid') {
      log.error('Invalid URL detected', { previewLink, user_id });
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    } else if (linkType.type === 'web') {
      log.info('Detected web link type', { previewLink, user_id });
      const res = await fetch("https://appslabs.store/app-info/web?url=" + previewLink, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API request failed: ${errorText}`);
      }
      appRes = await res.json();
      
      const response = {
          appData: {
            appid: appRes.domain,
            logo: appRes.favicon,
            title: appRes.title,
            category: appRes.keywords,
            bundleId: appRes.domain,
            storeLink: previewLink,
            linkType: linkType.type,
          },
          orgData: await orgData(appRes.domain),
        };
        log.info('Web app data response prepared', { previewLink, user_id, response});
        return NextResponse.json(response, { status: 200 });
    } else {

      log.info('Detected app link type', { previewLink, linkType, user_id });
      const [rows]: any = await pool.query("SELECT appid, icon, appname, category, developer, developer_email, developer_website FROM appinfo WHERE appid = ?", [linkType.appId]);
      const appFromDB = rows?.[0];

      if (appFromDB) {
        const response = {
          appData: {
            appid: appFromDB.appid,
            logo: appFromDB.icon,
            title: appFromDB.appname,
            category: appFromDB.category,
            bundleId: appFromDB.appid,
            storeLink: previewLink,
            linkType: linkType.type,
          },
          orgData: await orgData(appFromDB.developer_website),
        };
        return NextResponse.json(response, { status: 200 });
      } else if (linkType.type === 'ios') {
        const res = await fetch("https://appslabs.store/app-info/ios/?url=" + previewLink, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`API request failed: ${errorText}`);
        }
        appRes = await res.json();
      } else if (linkType.type === 'android') {
        const res = await fetch("https://appslabs.store/app-info/android?id=" + linkType.appId, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`API request failed: ${errorText}`);
        }
        appRes = await res.json();
      }
      
      // const orgData = await apolloFetch("organizations/enrich", "POST", {
      //   domain: appRes.website,
      // });
      // console.log('Apollo org data:', orgData);
      if (!appFromDB) {
        const insertResult = await pool.query(
          "INSERT INTO appinfo (url, appid, icon, appname, category, developer, developer_email, developer_website, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [previewLink, linkType.appId, appRes.icon, appRes.title, appRes.category, appRes.developer, appRes.developer_email, appRes.website, linkType.type]
        );
        console.log('New app info inserted with ID:', insertResult);
      }
      const response = {
        appData: {
          appid: linkType.appId,
          logo: appRes.icon,
          title: appRes.appname,
          category: appRes.category,
          bundleId: appRes.appid,
          storeLink: previewLink,
          linkType: linkType.type,
        },
        orgData: await orgData(appRes.website),
      };
      log.info('App data response prepared', { previewLink, user_id, response});
      return NextResponse.json(response, { status: 200 });

    }     
  } catch (error) {
    console.error('Preview link API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
