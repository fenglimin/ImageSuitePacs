export enum GroupHangingProtocal {
  ByPatent = 1,
  ByStudy = 2,
  BySeries = 3,
  FreeHang = 10,
  FreeHang_1X1 = 11,
  FreeHang_1X2 = 12,
  FreeHang_2X1 = 21,
  FreeHang_2X2 = 22,
  FreeHang_3X3 = 33
}

export enum ImageHangingProtocal {
  Auto = 1, // the layout will be determined by it modality.
  FreeHang = 10,
  FreeHang_1X1 = 11,
  FreeHang_1X2 = 12,
  FreeHang_2X1 = 21,
  FreeHang_2X2 = 22,
  FreeHang_3X3 = 33,
  FreeHang_4X3 = 43,
  FreeHang_6X5 = 65
}

export class GroupHangingData {
    groupHangingProtocal: GroupHangingProtocal;
    name: string;
    tip: string;
}

export class ImageHangingData {
    imageHangingProtocal: ImageHangingProtocal;
    name: string;
    tip: string;
}