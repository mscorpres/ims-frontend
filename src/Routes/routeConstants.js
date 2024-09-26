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
    products: {
      create: "/research-and-development/products",
      approval: "/research-and-development/products/approval",
    },
    bom: {
      create: "/research-and-development/bom/create",
      list: "/research-and-development/bom/list",
      drafts: "/research-and-development/bom/drafts",
    },
  },
  far: {
    upload: "/fixed-assets/upload",
  },
};
// to trigger
export default routeConstants;
// navigate(`${routeConstants.researchAndDevelopment.bom.create}?sku=${row.sku}`)
// import routeConstants from "@/Routes/routeConstants.js";
