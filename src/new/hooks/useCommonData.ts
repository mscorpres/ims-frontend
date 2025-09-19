import { useSelector, useDispatch } from "react-redux";
import {
  fetchVendors,
  fetchCostCenters,
  fetchProjects,
  fetchUsers,
  fetchBranches,
  clearVendorOptions,
  clearCostCenterOptions,
  clearProjectOptions,
  clearUserOptions,
  clearBranchOptions,
} from "../features/common/commonSlice";

export const useCommonData = () => {
  const dispatch = useDispatch();
  const commonState = useSelector((state: any) => state.common || {});

  const {
    vendorOptions = [],
    vendorLoading = false,
    vendorError,
    costCenterOptions = [],
    costCenterLoading = false,
    costCenterError,
    projectOptions = [],
    projectLoading = false,
    projectError,
    userOptions = [],
    userLoading = false,
    userError,
    branchOptions = [],
    branchLoading = false,
    branchError,
  } = commonState;

  const actions = {
    fetchVendors: (query: string) => dispatch(fetchVendors(query) as any),
    fetchCostCenters: (query: string) =>
      dispatch(fetchCostCenters(query) as any),
    fetchProjects: (query: string) => dispatch(fetchProjects(query) as any),
    fetchUsers: (query: string) => dispatch(fetchUsers(query) as any),
    fetchBranches: (query: string) => dispatch(fetchBranches(query) as any),
    clearVendorOptions: () => dispatch(clearVendorOptions()),
    clearCostCenterOptions: () => dispatch(clearCostCenterOptions()),
    clearProjectOptions: () => dispatch(clearProjectOptions()),
    clearUserOptions: () => dispatch(clearUserOptions()),
    clearBranchOptions: () => dispatch(clearBranchOptions()),
  };

  return {
    // Vendor data
    vendorOptions,
    vendorLoading,
    vendorError,

    // Cost center data
    costCenterOptions,
    costCenterLoading,
    costCenterError,

    // Project data
    projectOptions,
    projectLoading,
    projectError,

    // User data
    userOptions,
    userLoading,
    userError,

    // Branch data
    branchOptions,
    branchLoading,
    branchError,

    // Actions
    ...actions,
  };
};

