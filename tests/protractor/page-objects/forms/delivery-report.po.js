const utils = require('../../utils'),
  auth = require('../../auth')(),
  helper = require('../../helper');

const xml = `<?xml version="1.0"?>
<h:html xmlns="http://www.w3.org/2002/xforms" xmlns:ev="http://www.w3.org/2001/xml-events" xmlns:h="http://www.w3.org/1999/xhtml" xmlns:jr="http://openrosa.org/javarosa" xmlns:orx="http://openrosa.org/xforms" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <h:head>
    <h:title>Delivery Report</h:title>
    <model>
      <itext>
        <translation lang="hi">
          <text id="/delivery/group_delivery_summary/g_birth_date:jr:constraintMsg">
            <value>तारीख एक साल पहले और आज के बीच में होनी चाहिए</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_home_no_sba_birth:label">
            <value>नमस्ते <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) की घर पर, अनुभवी दाई के बिना डिलिवरी हो चुकी है | कृपया उनकी खतरे के संकेत पे निगरानी रखें| धन्यवाद!</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant:label">
            <value>क्या <output value=" /delivery/patient_name "/> अभी भी गर्भवती है?</value>
          </text>
          <text id="/delivery/patient_name:label">
            <value>मरीज का नाम</value>
          </text>
          <text id="/delivery/group_summary/r_followup_note1:label">
            <value>** ये SMS के रूप में <output value=" /delivery/chw_name "/> <output value=" /delivery/chw_phone "/> को भेजा जायेगा **</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_pregnancy_outcome/still_birth:label">
            <value>मृत जन्म</value>
          </text>
          <text id="/delivery/patient_id:label">
            <value>मरीज का ID</value>
          </text>
          <text id="/delivery/group_summary/r_followup_note2:label">
            <value><output value=" /delivery/group_note/g_chw_sms "/></value>
          </text>
          <text id="/delivery/group_note/is_sms_edited/yes:label">
            <value>हाँ</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/unknown:label">
            <value>नमस्ते <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) की डिलीवरी के लिए जांच स्वास्थ्य केंद्र में हो चुकी है |</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/home_sba_stillbirth:label">
            <value>नमस्ते <output value=" /delivery/chw_name "/>, हमें रिपोर्ट मिली है के <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) का बच्चा का मृत जन्म हुआ घर पर, अनुभवी दाई के साथ | जब उनकी गर्भावस्था की बाद की जांच का समय आएगा, हम आपको सूचित करेंगे | कृपया उनकी खतरे के संकेत पे निगरानी रखें और इस मुश्किल समय में <output value=" /delivery/patient_name "/> को सहारा दे | धन्यवाद |</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/facility_stillbirth:label">
            <value>नमस्ते <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) का बच्चा का स्वास्थ्य केंद्र में मृत जन्म हुआ | जब उनकी गर्भावस्था की बाद की जांच का समय आएगा, हम आपको सूचित करेंगे | कृपया उनकी खतरे के संकेत पे निगरानी रखें और इस मुश्किल समय में <output value=" /delivery/patient_name "/> को सहारा दे | धन्यवाद |</value>
          </text>
          <text id="/delivery/group_summary/r_followup:label">
            <value>सुनिश्चित करने के लिए सन्देश &lt;i class=&quot;fa fa-envelope&quot;&gt;&lt;/i&gt;</value>
          </text>
          <text id="/delivery/inputs:label">
            <value>मरीज</value>
          </text>
          <text id="/delivery/patient_contact_phone:label">
            <value>मरीज का फोन नंबर</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant/yes:label">
            <value>हाँ</value>
          </text>
          <text id="/delivery/inputs/contact/phone:label">
            <value>व्यक्ति का फ़ोन नंबर</value>
          </text>
          <text id="/delivery/group_summary/r_patient_info:label">
            <value>**<output value=" /delivery/patient_name "/>** ID: <output value=" /delivery/group_summary/r_patient_id "/></value></text>
          <text id="/delivery/chw_name:label">
            <value>सामुदायिक स्वास्थ्य कर्मी का नाम</value>
          </text>
          <text id="/delivery/inputs/contact/parent/contact/name:label">
            <value>सामुदायिक स्वास्थ्य कर्मी का नाम</value>
          </text>
          <text id="/delivery/chw_sms:label">
            <value>सामुदायिक स्वास्थ्य कर्मी का नोट</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_pregnancy_outcome/healthy:label">
            <value>जीवित जन्म</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/home_no_sba_stillbirth:label">
            <value>नमस्ते <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) का बच्चा का मृत जन्म हुआ घर पर, अनुभवी दाई के बिना | जब उनकी गर्भावस्था की बाद की जांच का समय आएगा, हम आपको सूचित करेंगे | कृपया उनकी खतरे के संकेत पे निगरानी रखें और इस मुश्किल समय में <output value=" /delivery/patient_name "/> को सहारा दे | धन्यवाद |</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_home_no_sba_stillbirth:label">
            <value>नमस्ते <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) का बच्चा का मृत जन्म हुआ घर पर, अनुभवी दाई के बिना | कृपया इस मुश्किल समय में <output value=" /delivery/patient_name "/> को सहारा दे | धन्यवाद |</value>
          </text>
          <text id="/delivery/inputs/source_id:label">
            <value>सोर्स ID</value>
          </text>
          <text id="/delivery/inputs/contact/sex:label">
            <value>लिंग</value>
          </text>
          <text id="/delivery/inputs/contact/parent/contact/phone:label">
            <value>सामुदायिक स्वास्थ्य कर्मी का फोन नंबर</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_delivery_code/ns:label">
            <value>घर पर, अनुभवी दाई के सहायता के बिना</value>
          </text>
          <text id="/delivery/group_summary/submit:label">
            <value>&lt;h4 style=&quot;text-align:center;&quot;&gt; सुनिश्चित करें के यह कार्रवाई पूरा करने के लिए आप सबमिट दबाये |&lt;/h4&gt;</value>
          </text>
          <text id="/delivery/group_summary/r_birth_date:label">
            <value>
              <output value=" /delivery/group_summary/r_delivery_location "/>पे डिलिवरी की गयी <output value=" /delivery/group_delivery_summary/display_birth_date "/></value></text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_home_sba_stillbirth:label">
            <value>नमस्ते <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) का बच्चा का मृत जन्म हुआ घर पर, अनुभवी दाई के साथ | कृपया इस मुश्किल समय में <output value=" /delivery/patient_name "/> को सहारा दे | धन्यवाद |</value>
          </text>
          <text id="/delivery/inputs/contact/name:label">
            <value>नाम</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant:jr:constraintMsg">
            <value>माफ़ कीजिये, आगे बढ़ने से पहले गर्भावस्था को पूरा करना होगा</value>
          </text>
          <text id="/delivery/group_summary/r_summary:label">
            <value>डिलीवरी के विवरण&lt;i class=&quot;fa fa-user&quot;&gt;&lt;/i&gt;</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_pregnancy_outcome/miscarriage:label">
            <value>गर्भपात</value>
          </text>
          <text id="/delivery/group_summary/r_pregnancy_outcome:label">
            <value>परिणाम: <output value=" /delivery/group_delivery_summary/display_delivery_outcome "/></value></text>
          <text id="/delivery/group_note/default_chw_sms/miscarriage:label">
            <value>नमस्ते <output value=" /delivery/chw_name "/>, हमें स्वास्थ्य केंद्र से रिपोर्ट मिली है के <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) का गर्भपात हुआ | कृपया इस मुश्किल समय में <output value=" /delivery/patient_name "/> को सहारा दे | धन्यवाद |</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/facility_birth:label">
            <value>खुशखबरी, <output value=" /delivery/chw_name "/>! <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) की स्वास्थ्य केंद्र में डिलीवरी हो चुकी है| जब उनकी गर्भावस्था की बाद की जांच का समय आएगा, हम आपको सूचित करेंगे | कृपया उनकी खतरे के संकेत पे निगरानी रखें | धन्यवाद!</value>
          </text>
          <text id="/delivery/group_note/is_sms_edited/no:label">
            <value>नहीं</value>
          </text>
          <text id="/delivery/geolocation:label">
            <value>स्थान</value>
          </text>
          <text id="/delivery/group_delivery_summary:label">
            <value>डिलीवरी की जानकारी</value>
          </text>
          <text id="/delivery/group_note/g_chw_sms:label">
            <value>यह सन्देश ऐसे ही भेजा जा सकता है या आप इस को बदल कर भी भेज सकते है</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_facility_stillbirth:label">
            <value>नमस्ते <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) का बच्चा का स्वास्थ्य केंद्र में मृत जन्म हुआ | कृपया इस मुश्किल समय में <output value=" /delivery/patient_name "/> को सहारा दे | धन्यवाद |</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_home_sba_birth:label">
            <value>नमस्ते <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) की घर पर, अनुभवी दाई के साथ डिलिवरी हो चुकी है | कृपया उनकी खतरे के संकेत पे निगरानी रखें| धन्यवाद!</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_delivery_code/f:label">
            <value>स्वास्थ्य केंद्र</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant/no:label">
            <value>नहीं</value>
          </text>
          <text id="/delivery/patient_uuid:label">
            <value>मरीज UUID</value>
          </text>
          <text id="/delivery/inputs/contact/parent/parent/parent/use_cases:label">
            <value>-</value>
          </text>
          <text id="/delivery/group_note:label">
            <value>सामुदायिक स्वास्थ्य कर्मी के लिए नोट</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_miscarriage:label">
            <value>नमस्ते <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) का स्वास्थ्य केंद्र में गर्भपात हुआ | कृपया इस मुश्किल समय में <output value=" /delivery/patient_name "/> को सहारा दे | धन्यवाद |</value>
          </text>
          <text id="/delivery/inputs/contact/date_of_birth:label">
            <value>जन्म की तारीख</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms:label">
            <value>-</value>
          </text>
          <text id="/delivery/group_chw_info:label">
            <value>लापता जन्म की रिपोर्ट</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant/unknown:label">
            <value>पता नहीं</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_pregnancy_outcome:label">
            <value>गर्भावस्था का परिणाम</value>
          </text>
          <text id="/delivery/inputs/source:label">
            <value>सोर्स</value>
          </text>
          <text id="/delivery/group_note/g_chw_sms:jr:constraintMsg">
            <value>आपका सन्देश 5 SMS से ऊपर नहीं हो सकता है | कृपया SMS का मूल्य को कम करने के लिए अपना सन्देश छोटा करें |</value>
          </text>
          <text id="/delivery/inputs/contact/_id:label">
            <value>मरीज का नाम क्या है?</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/home_sba_birth:label">
            <value>नमस्ते <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) की घर पर, अनुभवी दाई के साथ डिलिवरी हो चुकी है | जब उनकी गर्भावस्था की बाद की जांच का समय आएगा, हम आपको सूचित करेंगे | कृपया उनकी खतरे के संकेत पे निगरानी रखें| धन्यवाद!</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_delivery_code/s:label">
            <value>घर पर, अनुभवी दाई के सहायता के साथ</value>
          </text>
          <text id="/delivery/inputs/contact/patient_id:label">
            <value>मरीज का ID</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/home_no_sba_birth:label">
            <value>नमस्ते <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) की घर पर, अनुभवी दाई के बिना डिलिवरी हो चुकी है | जब उनकी गर्भावस्था की बाद की जांच का समय आएगा, हम आपको सूचित करेंगे | कृपया उनकी खतरे के संकेत पे निगरानी रखें| धन्यवाद!</value>
          </text>
          <text id="/delivery/group_chw_info/chw_information:label">
            <value><output value=" /delivery/patient_name "/>के लिए जन्म की रिपोर्ट दर्ज नहीं की गयी है</value></text>
          <text id="/delivery/chw_phone:label">
            <value>सामुदायिक स्वास्थ्य कर्मी का फोन नंबर</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_birth_date:label">
            <value>डिलीवरी की तारीख दर्ज करें</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_delivery_code:label">
            <value>डिलीवरी कि स्थान</value>
          </text>
          <text id="/delivery/inputs/contact/_id:hint">
            <value>सूची में से एक व्यक्ति को चुनें</value>
          </text>
          <text id="/delivery/group_note/is_sms_edited:label">
            <value>क्या आप सन्देश में कुछ जोड़ना या बदलना चाहते है?</value>
          </text>
          <text id="/delivery/group_note/g_chw_sms:hint">
            <value>
              <output value=" /delivery/chw_name "/>(<output value=" /delivery/chw_phone "/>) को संदेश भेजा जायेगा | संदेश की लंबाई सीमित है ताकी SMS का मूल्य उच्च ना हो|</value>
          </text>
          <text id="/delivery/group_chw_info/call_button:label">
            <value>**कृपया <output value=" /delivery/chw_name "/> के साथ मिल कर देखे के <output value=" /delivery/patient_name "/> अभी भी गर्भवती है |** कॉल: <output value=" /delivery/chw_phone "/></value></text>
          <text id="/delivery/patient_age_in_years:label">
            <value>साल</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_facility_birth:label">
            <value>खुशखबरी, <output value=" /delivery/chw_name "/>! <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) की स्वास्थ्य केंद्र में डिलीवरी हो चुकी है| कृपया उनकी खतरे के संकेत पे निगरानी रखें | धन्यवाद!</value>
          </text>
        </translation>
        <translation lang="en">
          <text id="/delivery/group_delivery_summary/g_birth_date:jr:constraintMsg">
            <value>Date must be between a year ago and today</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_home_no_sba_birth:label">
            <value>Hi <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) delivered at home without a skilled attendant. Please monitor them for danger signs. Thank you!</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant:label">
            <value>Is <output value=" /delivery/patient_name "/> still pregnant?</value>
          </text>
          <text id="/delivery/patient_name:label">
            <value>Patient Name</value>
          </text>
          <text id="/delivery/group_summary/r_followup_note1:label">
            <value>**The following will be sent as a SMS to <output value=" /delivery/chw_name "/> <output value=" /delivery/chw_phone "/>**</value>
          </text>
          <text id="/delivery/inputs/contact/parent/parent/parent/use_cases:label">
            <value>Use cases</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_pregnancy_outcome/still_birth:label">
            <value>Still Birth</value>
          </text>
          <text id="/delivery/patient_id:label">
            <value>Patient ID</value>
          </text>
          <text id="/delivery/group_summary/r_followup_note2:label">
            <value><output value=" /delivery/group_note/g_chw_sms "/></value>
          </text>
          <text id="/delivery/group_note/is_sms_edited/yes:label">
            <value>Yes</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/unknown:label">
            <value>Hi <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) was seen at the facility for delivery. Thank you.</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/home_sba_stillbirth:label">
            <value>Hi <output value=" /delivery/chw_name "/>, we received a report that <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) had a stillbirth at home with a skilled attendant. We will alert you when it is time for their PNC visits. Please monitor for danger signs and support <output value=" /delivery/patient_name "/> during this difficult time. Thank you.</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/facility_stillbirth:label">
            <value>Hi <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) had a stillbirth at the health facility. We will alert you when it is time for their PNC visits. Please support <output value=" /delivery/patient_name "/> during this difficult time. Thank you.</value>
          </text>
          <text id="/delivery/group_summary/r_followup:label">
            <value>Follow Up Message &lt;i class=&quot;fa fa-envelope&quot;&gt;&lt;/i&gt;</value>
          </text>
          <text id="/delivery/inputs:label">
            <value>Patient</value>
          </text>
          <text id="/delivery/patient_contact_phone:label">
            <value>Patient Phone</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant/yes:label">
            <value>Yes</value>
          </text>
          <text id="/delivery/inputs/contact/phone:label">
            <value>Person Phone</value>
          </text>
          <text id="/delivery/group_summary/r_patient_info:label">
            <value>**<output value=" /delivery/patient_name "/>**
ID: <output value=" /delivery/group_summary/r_patient_id "/></value></text>
          <text id="/delivery/chw_name:label">
            <value>CHW Name</value>
          </text>
          <text id="/delivery/inputs/contact/parent/contact/name:label">
            <value>CHW Name</value>
          </text>
          <text id="/delivery/chw_sms:label">
            <value>CHW's Note</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_pregnancy_outcome/healthy:label">
            <value>Live Birth</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/home_no_sba_stillbirth:label">
            <value>Hi <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) had a stillbirth at home with no skilled attendant. We will alert you when it is time for their PNC visits. Please monitor for danger signs and support <output value=" /delivery/patient_name "/> during this difficult time. Thank you.</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_home_no_sba_stillbirth:label">
            <value>Hi <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) had a stillbirth at home with no skilled attendant. Please support <output value=" /delivery/patient_name "/> during this difficult time. Thank you.</value>
          </text>
          <text id="/delivery/inputs/source_id:label">
            <value>Source ID</value>
          </text>
          <text id="/delivery/inputs/contact/sex:label">
            <value>Sex</value>
          </text>
          <text id="/delivery/inputs/contact/parent/contact/phone:label">
            <value>CHW Phone</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_delivery_code/ns:label">
            <value>Home with No Skilled Attendant</value>
          </text>
          <text id="/delivery/group_summary/submit:label">
            <value>&lt;h4 style=&quot;text-align:center;&quot;&gt;Be sure you Submit to complete this action.&lt;/h4&gt;</value>
          </text>
          <text id="/delivery/group_summary/r_birth_date:label">
            <value>Delivered <output value=" /delivery/group_delivery_summary/display_birth_date "/> at <output value=" /delivery/group_summary/r_delivery_location "/></value></text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_home_sba_stillbirth:label">
            <value>Hi <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) had a stillbirth at home with a skilled attendant. Please support <output value=" /delivery/patient_name "/> during this difficult time. Thank you.</value>
          </text>
          <text id="/delivery/inputs/contact/name:label">
            <value>Name</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant:jr:constraintMsg">
            <value>Sorry, the pregnancy must be complete to continue.</value>
          </text>
          <text id="/delivery/group_summary/r_summary:label">
            <value>Delivery Details&lt;i class=&quot;fa fa-user&quot;&gt;&lt;/i&gt;</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_pregnancy_outcome/miscarriage:label">
            <value>Miscarriage</value>
          </text>
          <text id="/delivery/group_summary/r_pregnancy_outcome:label">
            <value>Outcome: <output value=" /delivery/group_delivery_summary/display_delivery_outcome "/></value></text>
          <text id="/delivery/group_note/default_chw_sms/miscarriage:label">
            <value>Hi <output value=" /delivery/chw_name "/>, we received a report from the facility that <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) had a miscarriage. Please support <output value=" /delivery/patient_name "/> during this difficult time. Thank you.</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/facility_birth:label">
            <value>Good news, <output value=" /delivery/chw_name "/>! <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) has delivered at the health facility. We will alert you when it is time to refer them for PNC. Please monitor them for danger signs. Thank you!</value>
          </text>
          <text id="/delivery/group_note/is_sms_edited/no:label">
            <value>No</value>
          </text>
          <text id="/delivery/geolocation:label">
            <value>Location</value>
          </text>
          <text id="/delivery/group_delivery_summary:label">
            <value>Delivery Info</value>
          </text>
          <text id="/delivery/group_note/g_chw_sms:label">
            <value>The following message can be sent as is or modified to add a personal note</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_facility_stillbirth:label">
            <value>Hi <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) had a stillbirth at the health facility. Please support <output value=" /delivery/patient_name "/> during this difficult time. Thank you.</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_home_sba_birth:label">
            <value>Hi <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) delivered at home with a skilled attendant. Please monitor them for danger signs. Thank you!</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_delivery_code/f:label">
            <value>Facility</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant/no:label">
            <value>No</value>
          </text>
          <text id="/delivery/patient_uuid:label">
            <value>Patient UUID</value>
          </text>
          <text id="/delivery/group_note:label">
            <value>Note to the CHW</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_miscarriage:label">
            <value>Hi <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) had a miscarriage at the health facility. Please support <output value=" /delivery/patient_name "/> during this difficult time. Thank you.</value>
          </text>
          <text id="/delivery/inputs/contact/date_of_birth:label">
            <value>Date of Birth</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms:label">
            <value>Default SMS to send to CHW</value>
          </text>
          <text id="/delivery/group_chw_info:label">
            <value>Missing Birth Report</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant/unknown:label">
            <value>I'm not sure</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_pregnancy_outcome:label">
            <value>Pregnancy Outcome</value>
          </text>
          <text id="/delivery/inputs/source:label">
            <value>Source</value>
          </text>
          <text id="/delivery/group_note/g_chw_sms:jr:constraintMsg">
            <value>Your message cannot be longer than 5 SMS messages. Please shorten your message to reduce SMS costs.</value>
          </text>
          <text id="/delivery/inputs/contact/_id:label">
            <value>What is the patient's name?</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/home_sba_birth:label">
            <value>Hi <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) has delivered at home with a skilled attendant. We will alert you when it is time for their PNC visits. Please monitor them for danger signs. Thank you!</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_delivery_code/s:label">
            <value>Home with Skilled Attendant</value>
          </text>
          <text id="/delivery/inputs/contact/patient_id:label">
            <value>Patient ID</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/home_no_sba_birth:label">
            <value>Hi <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) has delivered at home without a skilled attendant. We will alert you when it is time for their PNC visits. Please monitor them for danger signs. Thank you!</value>
          </text>
          <text id="/delivery/group_chw_info/chw_information:label">
            <value>The birth report for <output value=" /delivery/patient_name "/> has not been recorded.</value>
          </text>
          <text id="/delivery/chw_phone:label">
            <value>CHW Phone</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_birth_date:label">
            <value>Enter Delivery Date</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_delivery_code:label">
            <value>Location of Delivery</value>
          </text>
          <text id="/delivery/inputs/contact/_id:hint">
            <value>Select a person from list</value>
          </text>
          <text id="/delivery/group_note/is_sms_edited:label">
            <value>Would you like to edit or add info to the message?</value>
          </text>
          <text id="/delivery/group_note/g_chw_sms:hint">
            <value>Message will be sent to <output value=" /delivery/chw_name "/> (<output value=" /delivery/chw_phone "/>). Messages are limited in length to avoid high SMS costs.</value>
          </text>
          <text id="/delivery/group_chw_info/call_button:label">
            <value>**Please follow up with <output value=" /delivery/chw_name "/> to see if <output value=" /delivery/patient_name "/> is still pregnant.**
Call: <output value=" /delivery/chw_phone "/></value></text>
          <text id="/delivery/patient_age_in_years:label">
            <value>Years</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_facility_birth:label">
            <value>Good news, <output value=" /delivery/chw_name "/>! <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) delivered at the health facility. Please monitor them for danger signs. Thank you!</value>
          </text>
        </translation>
        <translation lang="id">
          <text id="/delivery/group_delivery_summary/g_birth_date:jr:constraintMsg">
            <value>Tanggal harus antara satu tahun yang lalu dan hari ini.</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_home_no_sba_birth:label">
            <value>Halo <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) telah melahirkan di rumah tanpa dukun bersalin. Silahkan memantau mereka untuk tanda-tanda bahaya. Terima kasih!</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant:label">
            <value>Apakah <output value=" /delivery/patient_name "/> masih hamil?</value>
          </text>
          <text id="/delivery/patient_name:label">
            <value>Nama Pasien</value>
          </text>
          <text id="/delivery/group_summary/r_followup_note1:label">
            <value>**Berikut ini akan dikirim sebagai SMS ke <output value=" /delivery/chw_name "/> <output value=" /delivery/chw_phone "/>**</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_pregnancy_outcome/still_birth:label">
            <value>Kelahiran mati</value>
          </text>
          <text id="/delivery/patient_id:label">
            <value>Pasien ID</value>
          </text>
          <text id="/delivery/group_summary/r_followup_note2:label">
            <value><output value=" /delivery/group_note/g_chw_sms "/></value>
          </text>
          <text id="/delivery/group_note/is_sms_edited/yes:label">
            <value>Iya</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/unknown:label">
            <value>Halo <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) telah datang ke fasilitas untuk persalinan. Terima kasih.</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/home_sba_stillbirth:label">
            <value>Halo <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) memiliki kelahiran mati di rumah dengan dukun bersalin. Kami akan mengingatkan Anda bila waktu untuk merujuk mereka untuk PNC. Silahkan memantau mereka untuk tanda-tanda bahaya dan mendukung <output value=" /delivery/patient_name "/> selama masa sulit ini. Terima kasih.</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/facility_stillbirth:label">
            <value>Halo <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) memiliki kelahiran mati di fasilitas. Kami akan mengingatkan Anda bila waktu untuk merujuk mereka untuk PNC. Silahkan mendukung <output value=" /delivery/patient_name "/> selama masa sulit ini. Terima kasih.</value>
          </text>
          <text id="/delivery/group_summary/r_followup:label">
            <value>Follow Up Pesan &lt;i class=&quot;fa fa-envelope&quot;&gt;&lt;/i&gt;</value>
          </text>
          <text id="/delivery/inputs:label">
            <value>Pasien</value>
          </text>
          <text id="/delivery/patient_contact_phone:label">
            <value>Nomor Telepon Pasien</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant/yes:label">
            <value>Iya</value>
          </text>
          <text id="/delivery/inputs/contact/phone:label">
            <value>Nomor Telepon</value>
          </text>
          <text id="/delivery/group_summary/r_patient_info:label">
            <value>**<output value=" /delivery/patient_name "/>** ID : <output value=" /delivery/group_summary/r_patient_id "/></value></text>
          <text id="/delivery/chw_name:label">
            <value>Nama Kader</value>
          </text>
          <text id="/delivery/inputs/contact/parent/contact/name:label">
            <value>Nama Kader</value>
          </text>
          <text id="/delivery/chw_sms:label">
            <value>Catatan kader</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_pregnancy_outcome/healthy:label">
            <value>Kelahiran hidup</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/home_no_sba_stillbirth:label">
            <value>Halo <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) memiliki kelahiran mati di rumah tanpa dukun bersalin. Kami akan mengingatkan Anda bila waktu untuk merujuk mereka untuk PNC. Silahkan memantau mereka untuk tanda-tanda bahaya dan mendukung <output value=" /delivery/patient_name "/> selama masa sulit ini. Terima kasih.</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_home_no_sba_stillbirth:label">
            <value>Halo <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) memiliki kelahiran mati di rumah tanpa dukun bersalin. Silahkan mendukung <output value=" /delivery/patient_name "/> selama masa sulit ini. Terima kasih.</value>
          </text>
          <text id="/delivery/inputs/source_id:label">
            <value>Sumber ID</value>
          </text>
          <text id="/delivery/inputs/contact/sex:label">
            <value>Jenis kelamin</value>
          </text>
          <text id="/delivery/inputs/contact/parent/contact/phone:label">
            <value>Nomor Telepon Kader</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_delivery_code/ns:label">
            <value>Rumah tanpa dukun bersalin</value>
          </text>
          <text id="/delivery/group_summary/submit:label">
            <value>&lt;h4 style=&quot;text-align:center;&quot;&gt;Pastikan anda sudah mengirim untuk menyelesaikan tindakan ini.&lt;/h4&gt;</value>
          </text>
          <text id="/delivery/group_summary/r_birth_date:label">
            <value>Disampaikan <output value=" /delivery/group_delivery_summary/display_birth_date "/> di <output value=" /delivery/group_summary/r_delivery_location "/></value></text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_home_sba_stillbirth:label">
            <value>Halo <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) memiliki kelahiran mati di rumah dengan dukun bersalin. Silahkan mendukung <output value=" /delivery/patient_name "/> selama masa sulit ini. Terima kasih.</value>
          </text>
          <text id="/delivery/inputs/contact/name:label">
            <value>Nama</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant:jr:constraintMsg">
            <value>Maaf, kehamilan harus diselesaikan sebelum melanjutkan.</value>
          </text>
          <text id="/delivery/group_summary/r_summary:label">
            <value>Rincian kelahiran&lt;i class=&quot;fa fa-user&quot;&gt;&lt;/i&gt;</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_pregnancy_outcome/miscarriage:label">
            <value>Keguguran</value>
          </text>
          <text id="/delivery/group_summary/r_pregnancy_outcome:label">
            <value>Hasil: <output value=" /delivery/group_delivery_summary/display_delivery_outcome "/></value></text>
          <text id="/delivery/group_note/default_chw_sms/miscarriage:label">
            <value>Halo <output value=" /delivery/chw_name "/>, kami menerima laporan dari fasilitas yang <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) memiliki keguguran. Silahkan mendukung <output value=" /delivery/patient_name "/> selama masa sulit ini. Terima kasih.</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/facility_birth:label">
            <value>Berita baik, <output value=" /delivery/chw_name "/>! <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) telah melahirkan di fasilitas kesehatan. Kami akan mengingatkan Anda bila waktu untuk merujuk mereka untuk PNC. Silahkan memantau mereka untuk tanda-tanda bahaya. Terima kasih!</value>
          </text>
          <text id="/delivery/group_note/is_sms_edited/no:label">
            <value>Tidak</value>
          </text>
          <text id="/delivery/geolocation:label">
            <value>Tempat</value>
          </text>
          <text id="/delivery/group_delivery_summary:label">
            <value>Informasi persalinan</value>
          </text>
          <text id="/delivery/group_note/g_chw_sms:label">
            <value>Pesan berikut dapat dikirim sebagai adalah atau dimodifikasi untuk menambahkan catatan pribadi</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_facility_stillbirth:label">
            <value>Halo <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) memiliki kelahiran mati di fasilitas. Silahkan mendukung <output value=" /delivery/patient_name "/> selama masa sulit ini. Terima kasih.</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_home_sba_birth:label">
            <value>Halo <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) telah melahirkan di rumah dengan dukun bersalin. Silahkan memantau mereka untuk tanda-tanda bahaya. Terima kasih!</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_delivery_code/f:label">
            <value>Fasilitas kesehatan</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant/no:label">
            <value>Tidak</value>
          </text>
          <text id="/delivery/patient_uuid:label">
            <value>Pasien UUID</value>
          </text>
          <text id="/delivery/inputs/contact/parent/parent/parent/use_cases:label">
            <value>-</value>
          </text>
          <text id="/delivery/group_note:label">
            <value>Catatan ke kader</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_miscarriage:label">
            <value>Halo <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) memiliki keguguran di fasilitas kesehatan. Silahkan mendukung <output value=" /delivery/patient_name "/> selama masa sulit ini. Terima kasih.</value>
          </text>
          <text id="/delivery/inputs/contact/date_of_birth:label">
            <value>Tanggal lahir</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms:label">
            <value>-</value>
          </text>
          <text id="/delivery/group_chw_info:label">
            <value>Laporan Kelahiran Hilang</value>
          </text>
          <text id="/delivery/group_chw_info/still_pregnant/unknown:label">
            <value>Tidak yakin</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_pregnancy_outcome:label">
            <value>Kehamilan hasil</value>
          </text>
          <text id="/delivery/inputs/source:label">
            <value>Sumber</value>
          </text>
          <text id="/delivery/group_note/g_chw_sms:jr:constraintMsg">
            <value>Pesan anda tidak boleh lebih dari 5 pesan SMS. Persingkat pesan Anda untuk mengurangi biaya SMS.</value>
          </text>
          <text id="/delivery/inputs/contact/_id:label">
            <value>Apa nama pasien?</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/home_sba_birth:label">
            <value>Halo <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) telah melahirkan di rumah dengan dukun bersalin. Kami akan mengingatkan Anda bila waktu untuk merujuk mereka untuk PNC. Silahkan memantau mereka untuk tanda-tanda bahaya. Terima kasih!</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_delivery_code/s:label">
            <value>Rumah dengan dukun bersalin</value>
          </text>
          <text id="/delivery/inputs/contact/patient_id:label">
            <value>Pasien ID</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/home_no_sba_birth:label">
            <value>Halo <output value=" /delivery/chw_name "/>, <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) telah melahirkan di rumah tanpa dukun bersalin. Kami akan mengingatkan Anda bila waktu untuk merujuk mereka untuk PNC. Silahkan memantau mereka untuk tanda-tanda bahaya. Terima kasih!</value>
          </text>
          <text id="/delivery/group_chw_info/chw_information:label">
            <value>Laporan kelahiran untuk <output value=" /delivery/patient_name "/> belum terdata.</value>
          </text>
          <text id="/delivery/chw_phone:label">
            <value>Nomor Telepon Kader</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_birth_date:label">
            <value>Masukkan tanggal persalinan</value>
          </text>
          <text id="/delivery/group_delivery_summary/g_delivery_code:label">
            <value>Lokasi persalianan</value>
          </text>
          <text id="/delivery/inputs/contact/_id:hint">
            <value>Pilih orang dari daftar</value>
          </text>
          <text id="/delivery/group_note/is_sms_edited:label">
            <value>Apakah anda ingin mengedit atau menambahkan info untuk pesan?</value>
          </text>
          <text id="/delivery/group_note/g_chw_sms:hint">
            <value>Pesan akan dikirim ke <output value=" /delivery/chw_name "/> (<output value=" /delivery/chw_phone "/>). Pesan dibatasi panjang untuk menghindari biaya SMS yang tinggi.</value>
          </text>
          <text id="/delivery/group_chw_info/call_button:label">
            <value>**Ikuti dengan <output value=" /delivery/chw_name "/> untuk melihat apakah <output value=" /delivery/patient_name "/> masih hamil.** Sebut: <output value=" /delivery/chw_phone "/></value></text>
          <text id="/delivery/patient_age_in_years:label">
            <value>Umur</value>
          </text>
          <text id="/delivery/group_note/default_chw_sms/anc_only_facility_birth:label">
            <value>Berita baik, <output value=" /delivery/chw_name "/>! <output value=" /delivery/patient_name "/> (<output value=" /delivery/group_summary/r_patient_id "/>) telah melahirkan di fasilitas kesehatan. Silahkan memantau mereka untuk tanda-tanda bahaya. Terima kasih!</value>
          </text>
        </translation>
      </itext>
      <instance>
        <delivery delimiter="#" id="delivery" prefix="J1!delivery!" version="2016-04-06">
          <inputs tag="hidden">
            <meta tag="hidden">
              <location>
                <lat/>
                <long/>
                <error/>
                <message/>
              </location>
            </meta>
            <source>user</source>
            <source_id/>
            <contact>
              <_id/>
              <patient_id/>
              <name/>
              <date_of_birth>0</date_of_birth>
              <sex/>
              <phone/>
              <parent>
                <contact>
                  <phone/>
                  <name/>
                </contact>
                <parent>
                  <parent>
                    <use_cases/>
                  </parent>
                </parent>
              </parent>
            </contact>
          </inputs>
          <patient_uuid tag="hidden"/>
          <patient_id/>
          <patient_name/>
          <chw_name/>
          <chw_phone/>
          <birth_date/>
          <delivery_code/>
          <pregnancy_outcome/>
          <chw_sms/>
          <geolocation tag="hidden"/>
          <patient_age_in_years tag="hidden">0</patient_age_in_years>
          <patient_contact_phone tag="hidden"/>
          <group_chw_info tag="hidden">
            <chw_information/>
            <call_button/>
            <still_pregnant>no</still_pregnant>
          </group_chw_info>
          <group_delivery_summary tag="hidden">
            <g_pregnancy_outcome/>
            <g_delivery_code/>
            <g_birth_date/>
            <display_birth_date/>
            <display_delivery_outcome/>
          </group_delivery_summary>
          <group_note tag="hidden">
            <default_chw_sms/>
            <is_sms_edited/>
            <g_chw_sms/>
          </group_note>
          <group_summary tag="hidden">
            <submit/>
            <r_summary/>
            <r_patient_id/>
            <r_delivery_location/>
            <r_patient_info/>
            <r_pregnancy_outcome/>
            <r_birth_date/>
            <r_followup/>
            <r_followup_note1/>
            <r_followup_note2/>
          </group_summary>
          <meta tag="hidden">
            <instanceID/>
          </meta>
        </delivery>
      </instance>
      <bind nodeset="/delivery/inputs" relevant="./source = 'user'"/>
      <bind nodeset="/delivery/inputs/source" type="string"/>
      <bind nodeset="/delivery/inputs/source_id" type="string"/>
      <bind nodeset="/delivery/inputs/contact/_id" required="true()" type="db:person"/>
      <bind nodeset="/delivery/inputs/contact/patient_id" type="string"/>
      <bind nodeset="/delivery/inputs/contact/name" type="string"/>
      <bind nodeset="/delivery/inputs/contact/date_of_birth" type="string"/>
      <bind nodeset="/delivery/inputs/contact/sex" type="string"/>
      <bind nodeset="/delivery/inputs/contact/phone" type="string"/>
      <bind nodeset="/delivery/inputs/contact/parent/contact/phone" type="string"/>
      <bind nodeset="/delivery/inputs/contact/parent/contact/name" type="string"/>
      <bind nodeset="/delivery/inputs/contact/parent/parent/parent/use_cases" type="string"/>
      <bind calculate="../inputs/contact/_id" nodeset="/delivery/patient_uuid" type="string"/>
      <bind calculate="../inputs/contact/patient_id" nodeset="/delivery/patient_id" type="string"/>
      <bind calculate="../inputs/contact/name" nodeset="/delivery/patient_name" type="string"/>
      <bind calculate="../inputs/contact/parent/contact/name" nodeset="/delivery/chw_name" type="string"/>
      <bind calculate="../inputs/contact/parent/contact/phone" nodeset="/delivery/chw_phone" type="string"/>
      <bind calculate=" /delivery/group_delivery_summary/g_birth_date " nodeset="/delivery/birth_date" type="string"/>
      <bind calculate=" /delivery/group_delivery_summary/g_delivery_code " nodeset="/delivery/delivery_code" type="string"/>
      <bind calculate=" /delivery/group_delivery_summary/g_pregnancy_outcome " nodeset="/delivery/pregnancy_outcome" type="string"/>
      <bind calculate=" /delivery/group_note/g_chw_sms " nodeset="/delivery/chw_sms" type="string"/>
      <bind calculate="concat(../../inputs/meta/location/lat, concat(' ', ../../inputs/meta/location/long))" nodeset="/delivery/geolocation" type="string"/>
      <bind calculate="floor( difference-in-months(  /delivery/inputs/contact/date_of_birth , today() ) div 12 )" nodeset="/delivery/patient_age_in_years" type="string"/>
      <bind calculate="coalesce(/postnatal_care/inputs/contact/phone,/postnatal_care/inputs/contact/parent/contact/phone)" nodeset="/delivery/patient_contact_phone" type="string"/>
      <bind nodeset="/delivery/group_chw_info" relevant=" /delivery/inputs/source  = 'task'"/>
      <bind nodeset="/delivery/group_chw_info/chw_information" readonly="true()" type="string"/>
      <bind nodeset="/delivery/group_chw_info/call_button" readonly="true()" type="string"/>
      <bind constraint="selected(.,'no')" jr:constraintMsg="jr:itext('/delivery/group_chw_info/still_pregnant:jr:constraintMsg')" nodeset="/delivery/group_chw_info/still_pregnant" required="true()" type="select1"/>
      <bind nodeset="/delivery/group_delivery_summary" relevant="selected( /delivery/group_chw_info/still_pregnant , 'no')"/>
      <bind nodeset="/delivery/group_delivery_summary/g_pregnancy_outcome" required="true()" type="select1"/>
      <bind nodeset="/delivery/group_delivery_summary/g_delivery_code" relevant=" /delivery/group_delivery_summary/g_pregnancy_outcome  != 'miscarriage'" required="true()" type="select1"/>
      <bind constraint="(decimal-date-time(.) &lt;= decimal-date-time(today())) and ((decimal-date-time(today()) - decimal-date-time(.)) &lt; 365)" jr:constraintMsg="jr:itext('/delivery/group_delivery_summary/g_birth_date:jr:constraintMsg')" nodeset="/delivery/group_delivery_summary/g_birth_date" relevant=" /delivery/group_delivery_summary/g_pregnancy_outcome  != 'miscarriage'" type="date"/>
      <bind calculate="format-date ( /delivery/group_delivery_summary/g_birth_date , '%b %e, %Y')" nodeset="/delivery/group_delivery_summary/display_birth_date" type="string"/>
      <bind calculate="jr:choice-name( /delivery/group_delivery_summary/g_pregnancy_outcome ,' /delivery/group_delivery_summary/g_pregnancy_outcome ')" nodeset="/delivery/group_delivery_summary/display_delivery_outcome" type="string"/>
      <bind calculate="if( /delivery/inputs/contact/parent/parent/parent/use_cases  = 'anc',
 if( /delivery/pregnancy_outcome  = 'healthy',
 if( /delivery/delivery_code  = 'f',
 'anc_only_facility_birth',
 if ( /delivery/delivery_code  = 's',
 'anc_only_home_sba_birth',
 'anc_only_home_no_sba_birth'
 )
 ),
 if( /delivery/pregnancy_outcome  = 'still_birth',
 if( /delivery/delivery_code  = 'f',
 'anc_only_facility_stillbirth',
 if( /delivery/delivery_code  = 's',
 'anc_only_home_sba_stillbirth',
 'anc_only_home_no_sba_stillbirth'
 )
 ),
 if( /delivery/pregnancy_outcome  = 'miscarriage',
 'anc_only_miscarriage',
 ''
 )
 )
 ),
 if( /delivery/pregnancy_outcome  = 'healthy',
 if( /delivery/delivery_code  = 'f',
 'facility_birth',
 if ( /delivery/delivery_code  = 's',
 'home_sba_birth',
 'home_no_sba_birth'
 )
 ),
 if( /delivery/pregnancy_outcome  = 'still_birth',
 if( /delivery/delivery_code  = 'f',
 'facility_stillbirth',
 if( /delivery/delivery_code  = 's',
 'home_sba_stillbirth',
 'home_no_sba_stillbirth'
 )
 ),
 if( /delivery/pregnancy_outcome  = 'miscarriage',
 'miscarriage',
 'unknown'
 )
 )
 )
)" nodeset="/delivery/group_note/default_chw_sms" type="select1"/>
      <bind nodeset="/delivery/group_note/is_sms_edited" relevant="false()" required="true()" type="select1"/>
      <bind calculate="jr:choice-name( /delivery/group_note/default_chw_sms ,' /delivery/group_note/default_chw_sms ')" constraint="string-length(.) &lt;= 715" jr:constraintMsg="jr:itext('/delivery/group_note/g_chw_sms:jr:constraintMsg')" nodeset="/delivery/group_note/g_chw_sms" type="string"/>
      <bind nodeset="/delivery/group_summary/submit" readonly="true()" type="string"/>
      <bind nodeset="/delivery/group_summary/r_summary" readonly="true()" type="string"/>
      <bind calculate="../../inputs/contact/patient_id" nodeset="/delivery/group_summary/r_patient_id" type="string"/>
      <bind calculate="jr:choice-name( /delivery/group_delivery_summary/g_delivery_code , ' /delivery/group_delivery_summary/g_delivery_code ')" nodeset="/delivery/group_summary/r_delivery_location" type="string"/>
      <bind nodeset="/delivery/group_summary/r_patient_info" readonly="true()" type="string"/>
      <bind nodeset="/delivery/group_summary/r_pregnancy_outcome" readonly="true()" type="string"/>
      <bind nodeset="/delivery/group_summary/r_birth_date" readonly="true()" relevant=" /delivery/pregnancy_outcome  != 'miscarriage'" type="string"/>
      <bind nodeset="/delivery/group_summary/r_followup" readonly="true()" relevant=" /delivery/group_note/g_chw_sms  != ''" type="string"/>
      <bind nodeset="/delivery/group_summary/r_followup_note1" readonly="true()" relevant=" /delivery/group_note/g_chw_sms  != ''" type="string"/>
      <bind nodeset="/delivery/group_summary/r_followup_note2" readonly="true()" relevant=" /delivery/group_note/g_chw_sms  != ''" type="string"/>
      <bind calculate="concat('uuid:', uuid())" nodeset="/delivery/meta/instanceID" readonly="true()" type="string"/>
    </model>
  </h:head>
  <h:body class="pages">
    <group appearance="field-list" ref="/delivery/inputs">
      <label ref="jr:itext('/delivery/inputs:label')"/>
      <input appearance="hidden" ref="/delivery/inputs/source">
        <label ref="jr:itext('/delivery/inputs/source:label')"/>
      </input>
      <input appearance="hidden" ref="/delivery/inputs/source_id">
        <label ref="jr:itext('/delivery/inputs/source_id:label')"/>
      </input>
      <group ref="/delivery/inputs/contact">
        <input appearance="db-object" ref="/delivery/inputs/contact/_id">
          <label ref="jr:itext('/delivery/inputs/contact/_id:label')"/>
          <hint ref="jr:itext('/delivery/inputs/contact/_id:hint')"/>
        </input>
        <input appearance="hidden" ref="/delivery/inputs/contact/patient_id">
          <label ref="jr:itext('/delivery/inputs/contact/patient_id:label')"/>
        </input>
        <input appearance="hidden" ref="/delivery/inputs/contact/name">
          <label ref="jr:itext('/delivery/inputs/contact/name:label')"/>
        </input>
        <input appearance="hidden" ref="/delivery/inputs/contact/date_of_birth">
          <label ref="jr:itext('/delivery/inputs/contact/date_of_birth:label')"/>
        </input>
        <input appearance="hidden" ref="/delivery/inputs/contact/sex">
          <label ref="jr:itext('/delivery/inputs/contact/sex:label')"/>
        </input>
        <input appearance="hidden" ref="/delivery/inputs/contact/phone">
          <label ref="jr:itext('/delivery/inputs/contact/phone:label')"/>
        </input>
        <group ref="/delivery/inputs/contact/parent">
          <group ref="/delivery/inputs/contact/parent/contact">
            <input appearance="hidden" ref="/delivery/inputs/contact/parent/contact/phone">
              <label ref="jr:itext('/delivery/inputs/contact/parent/contact/phone:label')"/>
            </input>
            <input appearance="hidden" ref="/delivery/inputs/contact/parent/contact/name">
              <label ref="jr:itext('/delivery/inputs/contact/parent/contact/name:label')"/>
            </input>
          </group>
          <group ref="/delivery/inputs/contact/parent/parent">
            <group ref="/delivery/inputs/contact/parent/parent/parent">
              <input appearance="hidden" ref="/delivery/inputs/contact/parent/parent/parent/use_cases">
                <label ref="jr:itext('/delivery/inputs/contact/parent/parent/parent/use_cases:label')"/>
              </input>
            </group>
          </group>
        </group>
      </group>
    </group>
    <group appearance="field-list" ref="/delivery/group_chw_info">
      <label ref="jr:itext('/delivery/group_chw_info:label')"/>
      <input ref="/delivery/group_chw_info/chw_information">
        <label ref="jr:itext('/delivery/group_chw_info/chw_information:label')"/>
      </input>
      <input ref="/delivery/group_chw_info/call_button">
        <label ref="jr:itext('/delivery/group_chw_info/call_button:label')"/>
      </input>
      <select1 ref="/delivery/group_chw_info/still_pregnant">
        <label ref="jr:itext('/delivery/group_chw_info/still_pregnant:label')"/>
        <item>
          <label ref="jr:itext('/delivery/group_chw_info/still_pregnant/yes:label')"/>
          <value>yes</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_chw_info/still_pregnant/no:label')"/>
          <value>no</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_chw_info/still_pregnant/unknown:label')"/>
          <value>unknown</value>
        </item>
      </select1>
    </group>
    <group appearance="field-list" ref="/delivery/group_delivery_summary">
      <label ref="jr:itext('/delivery/group_delivery_summary:label')"/>
      <select1 appearance="horizontal" ref="/delivery/group_delivery_summary/g_pregnancy_outcome">
        <label ref="jr:itext('/delivery/group_delivery_summary/g_pregnancy_outcome:label')"/>
        <item>
          <label ref="jr:itext('/delivery/group_delivery_summary/g_pregnancy_outcome/healthy:label')"/>
          <value>healthy</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_delivery_summary/g_pregnancy_outcome/still_birth:label')"/>
          <value>still_birth</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_delivery_summary/g_pregnancy_outcome/miscarriage:label')"/>
          <value>miscarriage</value>
        </item>
      </select1>
      <select1 ref="/delivery/group_delivery_summary/g_delivery_code">
        <label ref="jr:itext('/delivery/group_delivery_summary/g_delivery_code:label')"/>
        <item>
          <label ref="jr:itext('/delivery/group_delivery_summary/g_delivery_code/f:label')"/>
          <value>f</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_delivery_summary/g_delivery_code/s:label')"/>
          <value>s</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_delivery_summary/g_delivery_code/ns:label')"/>
          <value>ns</value>
        </item>
      </select1>
      <input ref="/delivery/group_delivery_summary/g_birth_date">
        <label ref="jr:itext('/delivery/group_delivery_summary/g_birth_date:label')"/>
      </input>
    </group>
    <group appearance="field-list" ref="/delivery/group_note">
      <label ref="jr:itext('/delivery/group_note:label')"/>
      <select1 appearance="hidden" ref="/delivery/group_note/default_chw_sms">
        <label ref="jr:itext('/delivery/group_note/default_chw_sms:label')"/>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/facility_birth:label')"/>
          <value>facility_birth</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/home_sba_birth:label')"/>
          <value>home_sba_birth</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/home_no_sba_birth:label')"/>
          <value>home_no_sba_birth</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/facility_stillbirth:label')"/>
          <value>facility_stillbirth</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/home_sba_stillbirth:label')"/>
          <value>home_sba_stillbirth</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/home_no_sba_stillbirth:label')"/>
          <value>home_no_sba_stillbirth</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/miscarriage:label')"/>
          <value>miscarriage</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/unknown:label')"/>
          <value>unknown</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/anc_only_facility_birth:label')"/>
          <value>anc_only_facility_birth</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/anc_only_home_sba_birth:label')"/>
          <value>anc_only_home_sba_birth</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/anc_only_home_no_sba_birth:label')"/>
          <value>anc_only_home_no_sba_birth</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/anc_only_facility_stillbirth:label')"/>
          <value>anc_only_facility_stillbirth</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/anc_only_home_sba_stillbirth:label')"/>
          <value>anc_only_home_sba_stillbirth</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/anc_only_home_no_sba_stillbirth:label')"/>
          <value>anc_only_home_no_sba_stillbirth</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/default_chw_sms/anc_only_miscarriage:label')"/>
          <value>anc_only_miscarriage</value>
        </item>
      </select1>
      <select1 ref="/delivery/group_note/is_sms_edited">
        <label ref="jr:itext('/delivery/group_note/is_sms_edited:label')"/>
        <item>
          <label ref="jr:itext('/delivery/group_note/is_sms_edited/yes:label')"/>
          <value>yes</value>
        </item>
        <item>
          <label ref="jr:itext('/delivery/group_note/is_sms_edited/no:label')"/>
          <value>no</value>
        </item>
      </select1>
      <input appearance="multiline" ref="/delivery/group_note/g_chw_sms">
        <label ref="jr:itext('/delivery/group_note/g_chw_sms:label')"/>
        <hint ref="jr:itext('/delivery/group_note/g_chw_sms:hint')"/>
      </input>
    </group>
    <group appearance="field-list summary" ref="/delivery/group_summary">
      <input ref="/delivery/group_summary/submit">
        <label ref="jr:itext('/delivery/group_summary/submit:label')"/>
      </input>
      <input appearance="h1 yellow" ref="/delivery/group_summary/r_summary">
        <label ref="jr:itext('/delivery/group_summary/r_summary:label')"/>
      </input>
      <input appearance="h4 center" ref="/delivery/group_summary/r_patient_info">
        <label ref="jr:itext('/delivery/group_summary/r_patient_info:label')"/>
      </input>
      <input appearance="h5 center" ref="/delivery/group_summary/r_pregnancy_outcome">
        <label ref="jr:itext('/delivery/group_summary/r_pregnancy_outcome:label')"/>
      </input>
      <input appearance="h5 center" ref="/delivery/group_summary/r_birth_date">
        <label ref="jr:itext('/delivery/group_summary/r_birth_date:label')"/>
      </input>
      <input appearance="h1 green" ref="/delivery/group_summary/r_followup">
        <label ref="jr:itext('/delivery/group_summary/r_followup:label')"/>
      </input>
      <input ref="/delivery/group_summary/r_followup_note1">
        <label ref="jr:itext('/delivery/group_summary/r_followup_note1:label')"/>
      </input>
      <input appearance="li" ref="/delivery/group_summary/r_followup_note2">
        <label ref="jr:itext('/delivery/group_summary/r_followup_note2:label')"/>
      </input>
    </group>
  </h:body>
</h:html>`;

const userSettingsDocId = `org.couchdb.user:${auth.user}`;
const contactId = '3b3d50d275280d2568cd36281d00348b';
const docs = [
  {
    _id: 'form:delivery',
    internalId: 'D',
    title: 'Delivery',
    type: 'form',
    _attachments: {
      xml: {
        content_type: 'application/octet-stream',
        data: new Buffer(xml).toString('base64')
      }
    }
  }];

const selectRadioButton = (value) => {
  element(by.css(`[value=${value}]`)).click();
};

module.exports = {
  configureForm: (done) => {
    utils.seedTestData(done, contactId, docs);
  },
  teardown: done => {
    utils.afterEach()
      .then(() => utils.getDoc(userSettingsDocId))
      .then((user) => {
        user.contact_id = undefined;
        return utils.saveDoc(user);
      })
      .then(done, done);
  },
  nextPage: () => {
    const nextButton = element(by.css('button.btn.btn-primary.next-page'));
    helper.waitElementToBeClickable(nextButton);
    nextButton.click();
  },

  goBack: () => {
    element(by.css('button.btn.btn-default.previous-page')).click();
  },

  submit: () => {
    const submitButton = element(by.css('[ng-click="onSubmit()"]'));
    helper.waitElementToBeClickable(submitButton);
    submitButton.click();
    helper.waitElementToBeVisisble(element(by.css('div#reports-content')));
  },

  //patient page
  getPatientPageTitle: () => {
    return element(by.css('span[data-itext-id=/delivery/inputs:label]'));
  },

  selectPatientName: (name) => {
    browser.driver.navigate().refresh();
    helper.waitElementToBeClickable(element(by.css('button.btn.btn-primary.next-page')));

    element(by.css('.selection')).click();
    const search = element(by.css('.select2-search__field'));
    search.click();
    search.sendKeys(name);
    helper.waitElementToBeVisisble(element(by.css('.name')));
    element(by.css('.name')).click();
  },

  //Delivery Info page -- Pregnancy outcomes
  selectLiveBirthButton: () => {
    selectRadioButton('healthy');
  },
  selectStillBirthButton: () => {
    selectRadioButton('still_birth');
  },

  selectMiscarriageButton: () => {
    selectRadioButton('miscarriage');
  },

  //Delivery Info page -- Location of delivery
  selectFacilityButton: () => {
    selectRadioButton('f');
  },

  selectHomeSkilledButton: () => {
    selectRadioButton('s');
  },

  selectHomeNonSkilledButton: () => {
    selectRadioButton('ns');
  },

  //Delivery Info page -- Delivery date
  enterDeliveryDate: (deliveryDate) => {
    const datePicker = element(by.css('[placeholder="yyyy-mm-dd"]'));
    datePicker.click();
    //type date in the text box as '2017-04-23'
    datePicker.sendKeys(deliveryDate);
  },

  reset: () => {
    element(by.css('.icon.icon-refresh')).click();
  },

  //note to CHW
  getNoteToCHW: () => {
    return element(by.css('textarea')).getAttribute('value');
  },

  //summary page
  getOutcomeText: () => {
    return element(by.css('[lang="en"] [data-value=" /delivery/group_delivery_summary/display_delivery_outcome "]'))
      .getText();
  },

  getDeliveryLocationSummaryText: () => {
    return element(by.css('[lang="en"] [data-value=" /delivery/group_summary/r_delivery_location "]'))
      .getText();
  },

  getFollowUpMessage: () => {
    return element(by.css('[lang="en"] [data-value=" /delivery/group_note/g_chw_sms "]'))
      .getText();
  },
};