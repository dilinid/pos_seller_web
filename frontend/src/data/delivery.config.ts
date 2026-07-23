import type { SellerDeliveryConfig } from '../types/marketplace.type';

const BASE_FEE = 4.99;

export const DELIVERY_CONFIG: Record<string, SellerDeliveryConfig> = {
  s1: {
    districtFees: {
      'dist-colombo': 3.99, 'dist-gampaha': 2.99, 'dist-kandy': 5.99,
      'dist-galle': 6.99, 'dist-kurunegala': 5.49, 'dist-jaffna': 8.99,
      'dist-matara': 7.49, 'dist-negombo': 3.49, 'dist-anuradhapura': 7.99,
      'dist-ratnapura': 5.99,
    },
    freeDeliveryMin: 25,
    weightFeeBrackets: [{ id: 'b1', label: '0-5 kg', fromValue: 0, toValue: 5, fee: 1.50 }],
    volumeFeeBrackets: [],
    quantityFeeBrackets: [],
  },
  s2: {
    districtFees: {
      'dist-colombo': 2.99, 'dist-gampaha': 1.99, 'dist-kandy': 4.99,
      'dist-galle': 5.99, 'dist-kurunegala': 4.99, 'dist-jaffna': 7.99,
      'dist-matara': 6.49, 'dist-negombo': 2.49, 'dist-anuradhapura': 6.99,
      'dist-ratnapura': 4.99,
    },
    freeDeliveryMin: 30,
    weightFeeBrackets: [],
    volumeFeeBrackets: [],
    quantityFeeBrackets: [],
  },
  s3: {
    districtFees: {
      'dist-colombo': 2.49, 'dist-gampaha': 3.49, 'dist-kandy': 5.49,
      'dist-galle': 6.49, 'dist-kurunegala': 5.99, 'dist-jaffna': 8.49,
      'dist-matara': 6.99, 'dist-negombo': 3.99, 'dist-anuradhapura': 7.49,
      'dist-ratnapura': 5.49,
    },
    freeDeliveryMin: 20,
    weightFeeBrackets: [],
    volumeFeeBrackets: [],
    quantityFeeBrackets: [],
  },
  s4: {
    districtFees: {
      'dist-colombo': 1.99, 'dist-gampaha': 2.99, 'dist-kandy': 4.99,
      'dist-galle': 5.99, 'dist-kurunegala': 4.49, 'dist-jaffna': 7.99,
      'dist-matara': 6.49, 'dist-negombo': 2.99, 'dist-anuradhapura': 6.99,
      'dist-ratnapura': 4.99,
    },
    freeDeliveryMin: 15,
    weightFeeBrackets: [{ id: 'b1', label: '0-5 kg', fromValue: 0, toValue: 5, fee: 2.00 }],
    volumeFeeBrackets: [],
    quantityFeeBrackets: [],
  },
  s5: {
    districtFees: {
      'dist-colombo': 3.49, 'dist-gampaha': 3.99, 'dist-kandy': 5.99,
      'dist-galle': 6.99, 'dist-kurunegala': 5.99, 'dist-jaffna': 8.99,
      'dist-matara': 7.49, 'dist-negombo': 3.99, 'dist-anuradhapura': 7.99,
      'dist-ratnapura': 5.99,
    },
    freeDeliveryMin: null,
    weightFeeBrackets: [],
    volumeFeeBrackets: [],
    quantityFeeBrackets: [],
  },
  s6: {
    districtFees: {},
    freeDeliveryMin: null,
    weightFeeBrackets: [],
    volumeFeeBrackets: [],
    quantityFeeBrackets: [],
  },
  s7: {
    districtFees: {},
    freeDeliveryMin: null,
    weightFeeBrackets: [],
    volumeFeeBrackets: [],
    quantityFeeBrackets: [],
  },
  s8: {
    districtFees: {},
    freeDeliveryMin: null,
    weightFeeBrackets: [],
    volumeFeeBrackets: [],
    quantityFeeBrackets: [],
  },
  s9: {
    districtFees: {},
    freeDeliveryMin: null,
    weightFeeBrackets: [],
    volumeFeeBrackets: [],
    quantityFeeBrackets: [],
  },
  s10: {
    districtFees: {},
    freeDeliveryMin: null,
    weightFeeBrackets: [],
    volumeFeeBrackets: [],
    quantityFeeBrackets: [],
  },
  s11: {
    districtFees: {},
    freeDeliveryMin: null,
    weightFeeBrackets: [],
    volumeFeeBrackets: [],
    quantityFeeBrackets: [],
  },
};

export { BASE_FEE };
