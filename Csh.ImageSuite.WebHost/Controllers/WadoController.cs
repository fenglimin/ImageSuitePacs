using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Dicom;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Net.Http.Headers;
using System.Net.Http;
using Dicom.Imaging;
using Dicom;
using System.Diagnostics;
using System.IO;
using System.Net;
using Dicom.Imaging.Codec;
using System.Drawing;
using Dicom.IO;
using System.Threading.Tasks;
using System.Drawing.Imaging;
using System.Web.Http.Cors;
using System.Web.Mvc;

namespace Csh.ImageSuite.WebHost.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "GET")] //allows access by any host
    [RoutePrefix("wado")]
    public class WadoUriController : Controller
    {
        #region consts

        private const string AppDicomContentType = "application/dicom";
        private const string JpegImageContentType = "image/jpeg";

        #endregion

        private readonly IDbHelper _dbHelper;

        public WadoUriController()
        {
        }

        public WadoUriController(IPacsCoordinator pacsCoordinator)
        {
            _dbHelper = pacsCoordinator.GetCurrentDbHelper();
        }

        #region methods

        /// <summary>
        /// main wado method
        /// </summary>
        /// <param name="requestMessage">web request</param>
        /// <param name="requestType">always equals to wado in current wado specification, may change in the future</param>
        /// <param name="studyUID">study instance UID</param>
        /// <param name="seriesUID">serie instance UID</param>
        /// <param name="objectUID">instance UID</param>
        /// <param name="frameIndex">frame index</param>
        /// <param name="contentType">The value shall be a list of MIME types, separated by a "," character, and potentially associated with relative degree of preference, as specified in IETF RFC2616. </param>
        /// <param name="charset">character set of the object to be retrieved.</param>
        /// <param name="transferSyntax">The Transfer Syntax to be used within the DICOM image object, as specified in PS 3.6</param>
        /// <param name="anonymize">if value is "yes", indicates that we should anonymize object.
        /// The Server may return an error if it either cannot or refuses to anonymize that object</param>
        /// <returns></returns>
        [OutputCache(NoStore = true, Duration = 0)]
        public async Task<ActionResult> GetStudyInstances(HttpRequestMessage requestMessage, string requestType,
            string studyUID, string seriesUID, int objectUID, int frameIndex, string contentType = null, string charset = null,
            string transferSyntax = null, string anonymize = null)
        {

            //we do not handle anonymization
            if (anonymize == "yes")
                throw new Exception(String.Format("anonymise is not supported on the server", contentType));

            //we extract the content types from contentType value
            string[] contentTypes;
            bool canParseContentTypeParameter = ExtractContentTypesFromContentTypeParameter(contentType,
                out contentTypes);

            if (!canParseContentTypeParameter)
                throw new Exception(
                    String.Format("contentType parameter (value: {0}) cannot be parsed", contentType));


            //8.1.5 The Web Client shall provide list of content types it supports in the "Accept" field of the GET method. The
            //value of the contentType parameter of the request shall be one of the values specified in that field. 
            string[] acceptContentTypesHeader =
                requestMessage.Headers.Accept.Select(header => header.MediaType).ToArray();

            // */* means that we accept everything for the content Header
            bool acceptAllTypesInAcceptHeader = acceptContentTypesHeader.Contains("*/*");
            bool isRequestedContentTypeCompatibleWithAcceptContentHeader = acceptAllTypesInAcceptHeader ||
                                                                           contentTypes == null ||
                                                                           acceptContentTypesHeader.Intersect(
                                                                               contentTypes).Any();

            if (acceptContentTypesHeader.Length > 0 && !isRequestedContentTypeCompatibleWithAcceptContentHeader)
            {
                throw new Exception(
                    String.Format("content type {0} is not compatible with types specified in  Accept Header",
                        contentType));
            }

            //6.3.2.1 The MIME type shall be one on the MIME types defined in the contentType parameter, preferably the most
            //desired by the Web Client, and shall be in any case compatible with the ‘Accept’ field of the GET method.
            //Note: The HTTP behavior is that an error (406 – Not Acceptable) is returned if the required content type cannot
            //be served. 
            string[] compatibleContentTypesByOrderOfPreference =
                GetCompatibleContentTypesByOrderOfPreference(contentTypes,
                    acceptContentTypesHeader);

            //if there is no type that can be handled by our server, we return an error
            if (acceptContentTypesHeader.Length > 0 && compatibleContentTypesByOrderOfPreference != null
                && !compatibleContentTypesByOrderOfPreference.Contains(JpegImageContentType)
                && !compatibleContentTypesByOrderOfPreference.Contains(AppDicomContentType))
            {
                throw new Exception(
                    String.Format("content type(s) {0} cannot be served",
                        String.Join(" - ", compatibleContentTypesByOrderOfPreference)
                        ));
            }

            //we now need to handle the case where contentType is not specified, but in this case, the default value
            //depends on the image, so we need to open it
            string imgBasePath = _dbHelper.GetImageRootDir(objectUID);
            string imgPath = _dbHelper.GetImage(objectUID).FilePath;

            string imgFullPath = Path.Combine(imgBasePath, imgPath);
            if (imgFullPath == null)
            {
                throw new Exception("no image found");
            }

            try
            {
                IOManager.SetImplementation(DesktopIOManager.Instance);

                DicomFile dicomFile = await DicomFile.OpenAsync(imgFullPath);

                string finalContentType = PickFinalContentType(compatibleContentTypesByOrderOfPreference, dicomFile);

                return ReturnImageAsHttpResponse(dicomFile,
                    finalContentType, transferSyntax, frameIndex);
            }
            catch (Exception ex)
            {
                Trace.TraceError("exception when sending image: " + ex.ToString());

                throw;
            }
        }


        /// <summary>
        /// returns dicomFile in the content type given by finalContentType in a HttpResponseMessage.
        /// If content type is dicom, transfer syntax must be set to the given transferSyntax parameter.
        /// </summary>
        /// <param name="dicomFile"></param>
        /// <param name="finalContentType"></param>
        /// <param name="transferSyntax"></param>
        /// <param name="frameIndex"></param>
        /// <returns></returns>
        private ActionResult ReturnImageAsHttpResponse(DicomFile dicomFile, string finalContentType, string transferSyntax, int frameIndex)
        {
            MediaTypeHeaderValue header = null;
            Stream streamContent = null;

            if (finalContentType == JpegImageContentType)
            {
                DicomImage image = new DicomImage(dicomFile.Dataset);
                Bitmap bmp = image.RenderImage(frameIndex).As<Bitmap>();

                //When an image/jpeg MIME type is returned, the image shall be encoded using the JPEG baseline lossy 8
                //bit Huffman encoded non-hierarchical non-sequential process ISO/IEC 10918. 
                //TODO Is it the case with default Jpeg format from Bitmap?
                header = new MediaTypeHeaderValue(JpegImageContentType);
                streamContent = new MemoryStream();
                bmp.Save(streamContent, ImageFormat.Jpeg);
                streamContent.Seek(0, SeekOrigin.Begin);
            }
            else if (finalContentType == AppDicomContentType)
            {
                //By default, the transfer syntax shall be
                //"Explicit VR Little Endian".
                //Note: This implies that retrieved images are sent un-compressed by default.
                DicomTransferSyntax requestedTransferSyntax = DicomTransferSyntax.ExplicitVRLittleEndian;

                if (transferSyntax != null)
                    requestedTransferSyntax = GetTransferSyntaxFromString(transferSyntax);

                bool transferSyntaxIsTheSameAsSourceFile =
                    dicomFile.FileMetaInfo.TransferSyntax == requestedTransferSyntax;

                //we only change transfer syntax if we need to
                DicomFile dicomFileToStream;
                if (!transferSyntaxIsTheSameAsSourceFile)
                {
                    dicomFileToStream = dicomFile.Clone(requestedTransferSyntax);
                }
                else
                {
                    dicomFileToStream = dicomFile;
                }

                // Check if this is a multiframe image
                int numberOfFrame = 1;
                dicomFileToStream.Dataset.TryGetValue<int>(DicomTag.NumberOfFrames, 0, out numberOfFrame);
                if (numberOfFrame > 1)
                {
                    // This is a multiframe image, only return the speicify frame
                    var bytesImage = DicomPixelData.Create(dicomFileToStream.Dataset).GetFrame(frameIndex).Data;
                    dicomFileToStream.Dataset.AddOrUpdatePixelData(DicomVR.OB, new Dicom.IO.Buffer.MemoryByteBuffer(bytesImage));
                }
                else
                {
                    // This must be a single frame image
                    Debug.Assert(frameIndex == 0);
                }

                header = new MediaTypeHeaderValue(AppDicomContentType);
                streamContent = new MemoryStream();
                dicomFileToStream.Save(streamContent);
                streamContent.Seek(0, SeekOrigin.Begin);
            }


            //HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            //result.Content = new StreamContent(streamContent);
            //result.Content.Headers.ContentType = header;
            //Response.ContentType = header;

            return File(streamContent, AppDicomContentType); ;
        }

        /// <summary>
        /// Choose the final content type given compatibleContentTypesByOrderOfPreference and dicomFile
        /// </summary>
        /// <param name="compatibleContentTypesByOrderOfPreference"></param>
        /// <param name="dicomFile"></param>
        /// <returns></returns>
        private static string PickFinalContentType(string[] compatibleContentTypesByOrderOfPreference, DicomFile dicomFile)
        {
            if (compatibleContentTypesByOrderOfPreference.Length == 0)
                return AppDicomContentType;

            string chosenContentType = null;
            int nbFrames = 1;
            if (dicomFile.Dataset.Contains(DicomTag.NumberOfFrames))
            {
                nbFrames = dicomFile.Dataset.Get<int>(DicomTag.NumberOfFrames);
            }

            //if compatibleContentTypesByOrderOfPreference is null,
            //it means we must choose a default content type based on image content:
            //  *Single Frame Image Objects
            //      If the contentType parameter is not present in the request, the response shall contain an image/jpeg MIME
            //      type, if compatible with the ‘Accept’ field of the GET method. 
            //  *Multi Frame Image Objects
            //      If the contentType parameter is not present in the request, the response shall contain a application/dicom
            //      MIME type. 

            //not sure if this is how we distinguish multi frame objects?
            bool isMultiFrame = nbFrames > 1;
            bool chooseDefaultValue = compatibleContentTypesByOrderOfPreference == null;
            if (chooseDefaultValue)
            {
                if (isMultiFrame)
                {
                    chosenContentType = AppDicomContentType;
                }
                else
                {
                    chosenContentType = JpegImageContentType;
                }
            }
            else
            {
                //we need to take the compatible one
                chosenContentType = compatibleContentTypesByOrderOfPreference
                    .Intersect(new[] { AppDicomContentType, JpegImageContentType })
                    .First();
            }
            return chosenContentType;
        }

        /// <summary>
        /// extract content type values (may have multiple values according to IETF RFC2616)
        /// </summary>
        /// <param name="contentType">contentype string from wado request</param>
        /// <param name="contentTypes">extracted content types</param>
        /// <returns>false if there is a parse error, else true</returns>
        private static bool ExtractContentTypesFromContentTypeParameter(string contentType, out string[] contentTypes)
        {
            //8.1.5 MIME type of the response 
            //The value shall be a list of MIME types, separated by a "," character, and potentially associated with
            //relative degree of preference, as specified in IETF RFC2616. 
            //so we must split the string

            contentTypes = null;
            if (contentType != null && contentType.Contains(","))
            {
                contentTypes = contentType.Split(',');
            }
            else if (contentType == null)
            {
                contentTypes = null;
            }
            else
            {
                contentTypes = new[] { contentType };
            }

            //we now need to parse each type which follows the RFC2616 syntax
            //it also extracts parameters like jpeg quality but we discard it because we don't need them for now
            try
            {
                if (contentType != null)
                {
                    contentTypes =
                        contentTypes.Select(contentTypeString => MediaTypeHeaderValue.Parse(contentTypeString))
                            .Select(mediaTypeHeader => mediaTypeHeader.MediaType).ToArray();
                }
            }
            catch (FormatException)
            {
                {
                    return false;
                }
            }
            return true;
        }

        /// <summary>
        /// Get the compatible content types from the Accept Header, by order of preference
        /// </summary>
        /// <param name="contentTypes"></param>
        /// <param name="acceptContentTypesHeader"></param>
        /// <returns>
        /// compatible types by order of preference
        /// if contentTypes==null, returns null
        /// </returns>
        private static string[] GetCompatibleContentTypesByOrderOfPreference(
            string[] contentTypes, string[] acceptContentTypesHeader)
        {
            //je vérifie tout d'abord que parmis les types demandés, il y en a bien un que je gère.
            //je dois prendre l'intersection des types demandés et acceptés et les trier par ordre de préférence

            bool acceptAllTypesInAcceptHeader = acceptContentTypesHeader.Contains("*/*");

            string[] compatibleContentTypesByOrderOfPreference = null;
            if (acceptAllTypesInAcceptHeader)
            {
                compatibleContentTypesByOrderOfPreference = contentTypes;
            }
            //null represent the default value
            else if (contentTypes == null)
            {
                compatibleContentTypesByOrderOfPreference = null;
            }
            else
            {
                //intersect should preserve order (so it's already sorted by order of preference)
                compatibleContentTypesByOrderOfPreference = acceptContentTypesHeader.Intersect(contentTypes).ToArray();
            }
            return compatibleContentTypesByOrderOfPreference;
        }

        /// <summary>
        /// Converts string dicom transfert syntax to DicomTransferSyntax enumeration
        /// </summary>
        /// <param name="transferSyntax"></param>
        /// <returns></returns>
        private DicomTransferSyntax GetTransferSyntaxFromString(string transferSyntax)
        {
            try
            {
                return DicomParseable.Parse<DicomTransferSyntax>(transferSyntax);
            }
            catch (Exception)
            {
                //if we have an error, this probably means syntax is not supported
                //so according to 8.2.11 in spec, we use default ExplicitVRLittleEndian
                return DicomTransferSyntax.ExplicitVRLittleEndian;
            }
        }

        #endregion
    }
}
