const routeConstants = {
  finance: {
    vendor: {
      reco: {
        create: "/finance/vendor/reconcillation/create",
        report: "/finance/vendor/reconcillation/report",
      },
    },
  },
  researchAndDevelopment: {
    products: "/research-and-development/products",
    bom: {
      create: "/research-and-development/bom/create",
      list: "/research-and-development/bom/list",
    },
  },
  far: {
    upload: "/fixed-assets/upload",
  },
};
// to trigger
export default routeConstants;
