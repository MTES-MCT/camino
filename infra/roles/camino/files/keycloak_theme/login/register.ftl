<#import "template.ftl" as layout>
<#import "register-commons.ftl" as registerCommons>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','password','password-confirm'); section>
    <#if section = "form">
      <main class="fr-pt-md-14v" role="main" id="content">
    <div class="fr-container fr-container--fluid fr-mb-md-14v">
        <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
            <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
                <div class="fr-container">
                    <h1>Création de compte sur Camino</h1>
                </div>
            
                <div class="fr-container fr-background-alt--grey fr-px-md-0 fr-py-10v fr-py-md-14v">
                    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
                        <div class="fr-col-12 fr-col-md-9 fr-col-lg-8">
                            <div>
                                <form action="${url.registrationAction}"  method="post">
                                    <fieldset class="fr-fieldset" aria-labelledby="register-1760-fieldset-legend">
                                        <legend class="fr-fieldset__legend" id="register-1760-fieldset-legend">
                                            <h2>Coordonnées personnelles</h2>
                                        </legend>

                                        <div class="fr-fieldset__element">
                                            <fieldset class="fr-fieldset" id="credentials">                                                
                                                <div class="fr-fieldset__element">
                                                    <div class="fr-input-group <#if messagesPerField.existsError('firstName')>fr-input-group--error</#if>" aria-describedby="<#if messagesPerField.existsError('firstName')>text-input-firstName-error-desc-error</#if>">
                                                        <label class="fr-label" for="firstName">
                                                            ${msg("firstName")}
                                                        </label>
                                                        <input tabindex="1" 
                                                        class="fr-input" autocomplete="firstName" aria-required="true"
                                                        type="text" id="firstName"  name="firstName"
                                                        value="${(register.formData.firstName!'')}"
                                                        aria-invalid="<#if messagesPerField.existsError('firstName')>true</#if>">
                                                        <#if messagesPerField.existsError('firstName')>
                                                        <p id="text-input-firstName-error-desc-error" class="fr-error-text">
                                                            ${kcSanitize(messagesPerField.getFirstError('firstName'))?no_esc}
                                                        </p>
                                                        </#if>
                                                    </div>
                                                </div> 
                                                
                                                <div class="fr-fieldset__element">
                                                    <div class="fr-input-group <#if messagesPerField.existsError('lastName')>fr-input-group--error</#if>" aria-describedby="<#if messagesPerField.existsError('lastName')>text-input-lastName-error-desc-error</#if>">
                                                        <label class="fr-label" for="lastName">
                                                            ${msg("lastName")}
                                                        </label>
                                                        <input tabindex="2" 
                                                        class="fr-input" autocomplete="lastName" aria-required="true"
                                                        type="text" id="lastName"  name="lastName"
                                                        value="${(register.formData.lastName!'')}"
                                                        aria-invalid="<#if messagesPerField.existsError('lastName')>true</#if>">
                                                        <#if messagesPerField.existsError('lastName')>
                                                        <p id="text-input-lastName-error-desc-error" class="fr-error-text">
                                                            ${kcSanitize(messagesPerField.getFirstError('lastName'))?no_esc}
                                                        </p>
                                                        </#if>
                                                    </div>
                                                </div>

                                                                                                
                                                <div class="fr-fieldset__element">
                                                    <div class="fr-input-group <#if messagesPerField.existsError('email')>fr-input-group--error</#if>" aria-describedby="<#if messagesPerField.existsError('email')>text-input-email-error-desc-error</#if>">
                                                        <label class="fr-label" for="email">
                                                            ${msg("email")}
                                                        </label>
                                                        <input tabindex="3" 
                                                        class="fr-input" autocomplete="email" aria-required="true"
                                                        type="text" id="email"  name="email"
                                                        value="${(register.formData.email!'')}"
                                                        aria-invalid="<#if messagesPerField.existsError('email')>true</#if>">
                                                        <#if messagesPerField.existsError('email')>
                                                        <p id="text-input-email-error-desc-error" class="fr-error-text">
                                                            ${kcSanitize(messagesPerField.getFirstError('email'))?no_esc}
                                                        </p>
                                                        </#if>
                                                    </div>
                                                </div> 
                                                
                                                 <div class="fr-fieldset__element">
                                                    <div class="fr-input-group <#if messagesPerField.existsError('password')>fr-input-group--error</#if>" aria-describedby="<#if messagesPerField.existsError('password')>text-input-password-error-desc-error</#if>">
                                                        <label class="fr-label" for="password">
                                                            ${msg("password")}
                                                        </label>
                                                        <input tabindex="4" 
                                                        class="fr-input" autocomplete="off" aria-required="true"
                                                        type="password" id="password"  name="password"
                                                        aria-invalid="<#if messagesPerField.existsError('password')>true</#if>">
                                                        <#if messagesPerField.existsError('password')>
                                                        <p id="text-input-password-error-desc-error" class="fr-error-text">
                                                            ${kcSanitize(messagesPerField.getFirstError('password'))?no_esc}
                                                        </p>
                                                        </#if>
                                                    </div>
                                                </div> 


                                                
                                                 <div class="fr-fieldset__element">
                                                    <div class="fr-input-group <#if messagesPerField.existsError('password-confirm')>fr-input-group--error</#if>" aria-describedby="<#if messagesPerField.existsError('password-confirm')>text-input-password-confirm-error-desc-error</#if>">
                                                        <label class="fr-label" for="password-confirm">
                                                            ${msg("passwordConfirm")}
                                                        </label>
                                                        <input tabindex="5" 
                                                        class="fr-input" autocomplete="off" aria-required="true"
                                                        type="password" id="password-confirm"  name="password-confirm"
                                                        aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>">
                                                        <#if messagesPerField.existsError('password-confirm')>
                                                        <p id="text-input-password-confirm-error-desc-error" class="fr-error-text">
                                                            ${kcSanitize(messagesPerField.getFirstError('password-confirm'))?no_esc}
                                                        </p>
                                                        </#if>
                                                    </div>
                                                </div> 
                                            </fieldset>
                                        </div>
                                        <div class="fr-fieldset__element">
                                            <ul class="fr-btns-group">
                                                <li>
                                                    <button tabindex="3" class="fr-mt-2v fr-btn" name="login" type="submit">
                                                        Créer mon compte
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                         <div class="fr-fieldset__element">
                                        <a class='fr-link fr-link--icon-left fr-icon-arrow-left-line' href="${url.loginUrl}">${kcSanitize(msg("backToLogin"))?no_esc}</a>
                                        </div>
                                    </fieldset>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>
    </#if>
</@layout.registrationLayout>
