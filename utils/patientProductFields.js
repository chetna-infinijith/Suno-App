import moment from 'moment';

export const PATIENT_PRODUCT_DETAIL_QUERY =
  '{id,patient{id},sale{id,service_date},inventory_product{id,serial_number,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date,product{id,display_name,master_product{manufacturer{name},specification,type,subtype,description,model}},specification{color,battery,serial_number,additional_notes}},order_item{id,manufacturer{name},model},status,service_plan_expiration_date,extended_warranty_expiration_date,purchase_date,due_date,description,is_active,is_in_use,serial_number,notes,ear,type,subtype,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date,delivered_at,delivered_at_display,statuses{value,created_at}}';

export const PATIENT_PRODUCT_DETAIL_QUERY_FALLBACK =
  '{id,patient{id},sale{id,service_date},inventory_product{id,product{id,display_name,master_product{manufacturer{name},specification,type,subtype,description,model}},specification{color,battery,serial_number,additional_notes}},order_item{id,manufacturer{name},model},status,service_plan_expiration_date,extended_warranty_expiration_date,purchase_date,due_date,description,is_active,is_in_use,serial_number,notes,ear,type,subtype,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date,delivered_at,delivered_at_display,statuses{value,created_at}}';

const EMPTY_PRODUCT_VALUES = new Set([
  '',
  '-',
  '--',
  'None',
  'null',
  'undefined',
]);

const DATE_PARSE_FORMATS = [
  moment.ISO_8601,
  'YYYY-MM-DD',
  'YYYY-MM-DDTHH:mm:ssZ',
  'MM/DD/YYYY',
  'M/D/YYYY',
  'MMM DD, YYYY',
  'MMMM DD, YYYY',
  'DD MMM YYYY',
  'DD MMMM YYYY',
];

export const hasProductValue = value => {
  if (value == null) {
    return false;
  }
  const text = String(value).trim();
  return text.length > 0 && !EMPTY_PRODUCT_VALUES.has(text);
};

export const firstProductValue = (...values) => values.find(hasProductValue);

export const parsePatientProductDate = value => {
  if (!hasProductValue(value)) {
    return null;
  }
  const parsed = moment(value, DATE_PARSE_FORMATS, true);
  if (parsed.isValid()) {
    return parsed.toDate();
  }
  const fallback = moment(value);
  return fallback.isValid() ? fallback.toDate() : null;
};

export const formatPatientProductDate = value => {
  const parsed = parsePatientProductDate(value);
  return parsed ? moment(parsed).format('MMM DD, YYYY') : '-';
};

const getPathValue = (item, path) =>
  path.split('.').reduce((value, key) => value?.[key], item);

const pickDateFromSources = (item, sources = []) =>
  firstProductValue(...sources.map(path => getPathValue(item, path)));

// Confirmed dates: never fall back to a different date field.
const CONFIRMED_DATE_SOURCES = {
  mfrWarranty: [
    'manufacturer_warranty_expiration_date',
    'inventory_product.manufacturer_warranty_expiration_date',
  ],
  ldWarranty: [
    'loss_damage_warranty_expiration_date',
    'inventory_product.loss_damage_warranty_expiration_date',
  ],
};

// Other dates: use the field value, then the next priority date if blank.
const OTHER_DATE_SOURCES = {
  invoiceDate: ['purchase_date', 'sale.service_date'],
  servicePlan: ['service_plan_expiration_date'],
  returnDue: ['due_date'],
  delivery: ['delivered_at_display', 'delivered_at'],
  extendedWarranty: ['extended_warranty_expiration_date'],
};

const OTHER_DATE_PRIORITY = [
  'invoiceDate',
  'servicePlan',
  'returnDue',
  'delivery',
  'extendedWarranty',
];

export const getOwnPatientProductDate = (item, field) => {
  const sources =
    CONFIRMED_DATE_SOURCES[field] || OTHER_DATE_SOURCES[field] || [];
  return pickDateFromSources(item, sources);
};

export const getDisplayPatientProductDate = (item, field) => {
  if (CONFIRMED_DATE_SOURCES[field]) {
    return getOwnPatientProductDate(item, field);
  }

  const startIndex = OTHER_DATE_PRIORITY.indexOf(field);
  const fieldsToTry =
    startIndex === -1 ? [field] : OTHER_DATE_PRIORITY.slice(startIndex);

  for (const nextField of fieldsToTry) {
    const value = getOwnPatientProductDate(item, nextField);
    if (hasProductValue(value)) {
      return value;
    }
  }

  return undefined;
};

export const getPatientProductSerial = item =>
  firstProductValue(
    item?.serial_number,
    item?.inventory_product?.serial_number,
    item?.inventory_product?.specification?.serial_number
  ) || '-';

export const getManufacturerWarrantyDate = item =>
  getDisplayPatientProductDate(item, 'mfrWarranty');

export const getLossDamageWarrantyDate = item =>
  getDisplayPatientProductDate(item, 'ldWarranty');

export const getInvoiceDate = item =>
  getDisplayPatientProductDate(item, 'invoiceDate');

export const getServicePlanDate = item =>
  getDisplayPatientProductDate(item, 'servicePlan');

export const getReturnDueDate = item =>
  getDisplayPatientProductDate(item, 'returnDue');

export const getDeliveryDate = item =>
  getDisplayPatientProductDate(item, 'delivery');

export const getExtendedWarrantyDate = item =>
  getDisplayPatientProductDate(item, 'extendedWarranty');

const DATE_FIELD_LABELS = {
  mfrWarranty: 'MFR Warranty',
  ldWarranty: 'L&D Warranty',
  invoiceDate: 'Invoice Date',
  servicePlan: 'Service Plan',
  returnDue: 'Return Due',
  delivery: 'Delivery Date',
  extendedWarranty: 'Extended Warranty',
};

export const getOverviewHearingAidDateRows = (item, maxDates = 4) => {
  const rows = [
    {
      key: 'mfrWarranty',
      label: DATE_FIELD_LABELS.mfrWarranty,
      value: getOwnPatientProductDate(item, 'mfrWarranty'),
    },
    {
      key: 'ldWarranty',
      label: DATE_FIELD_LABELS.ldWarranty,
      value: getOwnPatientProductDate(item, 'ldWarranty'),
    },
  ];

  for (const field of OTHER_DATE_PRIORITY) {
    if (rows.length >= maxDates) {
      break;
    }
    const value = getOwnPatientProductDate(item, field);
    if (!hasProductValue(value)) {
      continue;
    }
    rows.push({
      key: field,
      label: DATE_FIELD_LABELS[field],
      value,
    });
  }

  return rows;
};

export const mergePatientProductDetail = (listItem, detail) => {
  if (!detail) {
    return listItem;
  }
  return {
    ...listItem,
    ...detail,
    inventory_product: detail.inventory_product || listItem?.inventory_product,
  };
};

let resolvedDetailQuery = null;

export const fetchPatientProductDetail = async (apiGet, constants, id) => {
  if (!id || typeof apiGet !== 'function') {
    return null;
  }

  const queries = resolvedDetailQuery
    ? [resolvedDetailQuery]
    : [PATIENT_PRODUCT_DETAIL_QUERY, PATIENT_PRODUCT_DETAIL_QUERY_FALLBACK];

  for (const query of queries) {
    try {
      const response = await apiGet(constants, { id, query });
      if (response?.status >= 200 && response?.status < 300 && response.json) {
        resolvedDetailQuery = query;
        return response.json;
      }
    } catch (_err) {
      // Try the fallback query if the first field set is rejected.
    }
  }

  return null;
};
